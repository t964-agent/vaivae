import type { EventsApi as EventsApiType, ProfilesApi as ProfilesApiType } from "klaviyo-api";
import type { MedusaEnv } from "../../lib/env";

type KlaviyoClient = {
  events: EventsApiType;
  profiles: ProfilesApiType;
};

type KlaviyoClientFactory = {
  createKlaviyoClient(privateKey: string): KlaviyoClient;
};

type UpsertProfileInput = {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  externalId?: string | null;
  properties?: Record<string, unknown>;
};

type TrackEventInput = {
  email: string;
  metric: string;
  properties: Record<string, unknown>;
  currency?: string | null | undefined;
  occurredAt?: Date | string | null | undefined;
  uniqueId?: string | null | undefined;
  value?: number | null | undefined;
};

type CommerceRecord = Record<string, unknown>;

type KlaviyoLineItem = {
  Brand: "vaivae";
  Categories: string[];
  ImageURL?: string;
  ItemPrice: number;
  ProductID?: string;
  ProductName: string;
  ProductURL?: string;
  Quantity: number;
  RowTotal: number;
  SKU?: string;
  VariantID?: string;
  VariantName?: string;
};

type ProfilePayload = Parameters<KlaviyoClient["profiles"]["createOrUpdateProfile"]>[0];
type ProfileAttributes = ProfilePayload["data"]["attributes"];
type EventPayload = Parameters<KlaviyoClient["events"]["createEvent"]>[0];
type EventAttributes = EventPayload["data"]["attributes"];
type SubscribePayload = Parameters<KlaviyoClient["profiles"]["bulkSubscribeProfiles"]>[0];
type UnsubscribePayload = Parameters<KlaviyoClient["profiles"]["bulkUnsubscribeProfiles"]>[0];

const { env } = require("../../lib/env") as {
  env: Pick<
    MedusaEnv,
    "KLAVIYO_NEWSLETTER_LIST_ID" | "KLAVIYO_PRIVATE_KEY" | "MEDUSA_STOREFRONT_URL"
  >;
};
const { createKlaviyoClient } = require("./client") as KlaviyoClientFactory;

const brandName = "vaivae";

function isRecord(value: unknown): value is CommerceRecord {
  return typeof value === "object" && value !== null;
}

function getRecord(value: unknown): CommerceRecord | null {
  return isRecord(value) ? value : null;
}

function getString(record: CommerceRecord | null, key: string): string | null {
  const value = record?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  if (isRecord(value)) {
    return getNumberValue(value["numeric"]) ?? getNumberValue(getRecord(value["raw"])?.["value"]);
  }

  return null;
}

function getNumber(record: CommerceRecord | null, key: string): number | null {
  return getNumberValue(record?.[key]);
}

function getInteger(record: CommerceRecord | null, key: string, fallback: number): number {
  const value = getNumber(record, key);

  return value === null ? fallback : Math.max(0, Math.round(value));
}

function getDate(value: unknown): Date | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const date = new Date(value);

    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function getArrayRecords(record: CommerceRecord | null, key: string): CommerceRecord[] {
  const value = record?.[key];

  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function normalizedEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();

  return normalized ? normalized : null;
}

function optionalString(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function toCurrencyCode(value: string | null | undefined): string | undefined {
  const normalized = value?.trim().toUpperCase();

  return normalized ? normalized : undefined;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function storefrontUrl(path: string): string {
  const base = env.MEDUSA_STOREFRONT_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${normalizedPath}`;
}

function productUrl(handle: string | null): string | undefined {
  return handle ? storefrontUrl(`/products/${encodeURIComponent(handle)}`) : undefined;
}

function addressProperties(address: unknown): Record<string, unknown> | undefined {
  const record = getRecord(address);

  if (!record) {
    return undefined;
  }

  const properties: Record<string, unknown> = {};
  const fields = [
    ["FirstName", "first_name"],
    ["LastName", "last_name"],
    ["Company", "company"],
    ["Address1", "address_1"],
    ["Address2", "address_2"],
    ["City", "city"],
    ["Region", "province"],
    ["PostalCode", "postal_code"],
    ["CountryCode", "country_code"],
  ] as const;

  for (const [target, source] of fields) {
    const value = getString(record, source);

    if (value) {
      properties[target] = value;
    }
  }

  return Object.keys(properties).length > 0 ? properties : undefined;
}

function lineItems(entity: CommerceRecord): KlaviyoLineItem[] {
  return getArrayRecords(entity, "items").map((item) => {
    const productName =
      getString(item, "product_title") ?? getString(item, "title") ?? "vaivae item";
    const quantity = getInteger(item, "quantity", 1);
    const unitPrice = getNumber(item, "unit_price") ?? 0;
    const rowTotal =
      getNumber(item, "total") ?? getNumber(item, "item_total") ?? unitPrice * quantity;
    const productHandle = getString(item, "product_handle");
    const mapped: KlaviyoLineItem = {
      Brand: brandName,
      Categories: unique(
        [getString(item, "product_collection"), getString(item, "product_type")].flatMap((value) =>
          value ? [value] : [],
        ),
      ),
      ItemPrice: unitPrice,
      ProductName: productName,
      Quantity: quantity,
      RowTotal: rowTotal,
    };
    const imageUrl = getString(item, "thumbnail");
    const url = productUrl(productHandle);
    const productId = getString(item, "product_id");
    const sku = getString(item, "variant_sku") ?? getString(item, "sku");
    const variantId = getString(item, "variant_id");
    const variantName = getString(item, "variant_title") ?? getString(item, "subtitle");

    if (imageUrl) {
      mapped.ImageURL = imageUrl;
    }

    if (productId) {
      mapped.ProductID = productId;
    }

    if (url) {
      mapped.ProductURL = url;
    }

    if (sku) {
      mapped.SKU = sku;
    }

    if (variantId) {
      mapped.VariantID = variantId;
    }

    if (variantName) {
      mapped.VariantName = variantName;
    }

    return mapped;
  });
}

function commerceProperties(entity: CommerceRecord): Record<string, unknown> {
  const items = lineItems(entity);
  const properties: Record<string, unknown> = {
    Brands: [brandName],
    Categories: unique(items.flatMap((item) => item.Categories)),
    ItemNames: items.map((item) => item.ProductName),
    Items: items,
  };
  const billingAddress = addressProperties(entity["billing_address"]);
  const shippingAddress = addressProperties(entity["shipping_address"]);
  const discountTotal = getNumber(entity, "discount_total");

  if (billingAddress) {
    properties["BillingAddress"] = billingAddress;
  }

  if (shippingAddress) {
    properties["ShippingAddress"] = shippingAddress;
  }

  if (discountTotal !== null) {
    properties["DiscountValue"] = discountTotal;
  }

  return properties;
}

function entityTotal(entity: CommerceRecord): number | undefined {
  return getNumber(entity, "total") ?? getNumber(entity, "item_total") ?? undefined;
}

function entityCurrency(entity: CommerceRecord): string | undefined {
  return toCurrencyCode(getString(entity, "currency_code"));
}

function getTrackingValue(fulfillment: CommerceRecord, key: string): string | null {
  const metadata = getRecord(fulfillment["metadata"]);
  const fromMetadata = getString(metadata, key);

  if (fromMetadata) {
    return fromMetadata;
  }

  const labels = getArrayRecords(fulfillment, "labels");

  for (const label of labels) {
    const value = getString(label, key);

    if (value) {
      return value;
    }
  }

  return null;
}

function getResponseBody(response: unknown): unknown {
  return getRecord(response)?.["body"];
}

function nestedRecord(value: unknown, key: string): CommerceRecord | null {
  return getRecord(getRecord(value)?.[key]);
}

function profileEmailFromResponse(response: unknown): string | null {
  const body = getResponseBody(response);
  const data = nestedRecord(body, "data");
  const attributes = nestedRecord(data, "attributes");
  const email = getString(attributes, "email");

  return email ? email.toLowerCase() : null;
}

class KlaviyoService {
  private client: KlaviyoClient | null = null;
  private readonly newsletterListId = env.KLAVIYO_NEWSLETTER_LIST_ID;
  private readonly privateKey = env.KLAVIYO_PRIVATE_KEY;

  private getClient(): KlaviyoClient | null {
    if (!this.privateKey) {
      return null;
    }

    this.client ??= createKlaviyoClient(this.privateKey);

    return this.client;
  }

  private canSyncList(): boolean {
    return Boolean(this.privateKey && this.newsletterListId);
  }

  async upsertProfile(input: UpsertProfileInput): Promise<void> {
    const client = this.getClient();
    const email = normalizedEmail(input.email);

    if (!client || !email) {
      return;
    }

    const attributes: ProfileAttributes = {
      email,
    };
    const firstName = optionalString(input.firstName);
    const lastName = optionalString(input.lastName);
    const phoneNumber = optionalString(input.phone);
    const externalId = optionalString(input.externalId);

    if (firstName) {
      attributes.firstName = firstName;
    }

    if (lastName) {
      attributes.lastName = lastName;
    }

    if (phoneNumber) {
      attributes.phoneNumber = phoneNumber;
    }

    if (externalId) {
      attributes.externalId = externalId;
    }

    if (input.properties && Object.keys(input.properties).length > 0) {
      attributes.properties = input.properties;
    }

    const payload: ProfilePayload = {
      data: {
        attributes,
        type: "profile",
      },
    };

    await client.profiles.createOrUpdateProfile(payload);
  }

  async setSubscribed(email: string, subscribed: boolean): Promise<void> {
    const client = this.getClient();
    const normalized = normalizedEmail(email);
    const newsletterListId = this.newsletterListId;

    if (!client || !normalized || !this.canSyncList() || !newsletterListId) {
      return;
    }

    const list = {
      data: {
        id: newsletterListId,
        type: "list" as const,
      },
    };

    if (subscribed) {
      const payload: SubscribePayload = {
        data: {
          attributes: {
            customSource: "medusa_marketing_consent",
            profiles: {
              data: [
                {
                  attributes: {
                    email: normalized,
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: "SUBSCRIBED",
                        },
                      },
                    },
                  },
                  type: "profile",
                },
              ],
            },
          },
          relationships: {
            list,
          },
          type: "profile-subscription-bulk-create-job",
        },
      };

      await client.profiles.bulkSubscribeProfiles(payload);
      return;
    }

    const payload: UnsubscribePayload = {
      data: {
        attributes: {
          profiles: {
            data: [
              {
                attributes: {
                  email: normalized,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: "UNSUBSCRIBED",
                      },
                    },
                  },
                },
                type: "profile",
              },
            ],
          },
        },
        relationships: {
          list,
        },
        type: "profile-subscription-bulk-delete-job",
      },
    };

    await client.profiles.bulkUnsubscribeProfiles(payload);
  }

  async trackEvent(input: TrackEventInput): Promise<void> {
    const client = this.getClient();
    const email = normalizedEmail(input.email);
    const metric = input.metric.trim();

    if (!client || !email || !metric) {
      return;
    }

    const attributes: EventAttributes = {
      metric: {
        data: {
          attributes: {
            name: metric,
          },
          type: "metric",
        },
      },
      profile: {
        data: {
          attributes: {
            email,
          },
          type: "profile",
        },
      },
      properties: input.properties,
    };
    const currency = toCurrencyCode(input.currency);
    const occurredAt = getDate(input.occurredAt);
    const uniqueId = optionalString(input.uniqueId);

    if (currency) {
      attributes.valueCurrency = currency;
    }

    if (occurredAt) {
      attributes.time = occurredAt;
    }

    if (typeof input.value === "number" && Number.isFinite(input.value)) {
      attributes.value = input.value;
    }

    if (uniqueId) {
      attributes.uniqueId = uniqueId;
    }

    const payload: EventPayload = {
      data: {
        attributes,
        type: "event",
      },
    };

    await client.events.createEvent(payload);
  }

  async getProfileEmail(profileId: string): Promise<string | null> {
    const client = this.getClient();
    const normalizedProfileId = profileId.trim();

    if (!client || !normalizedProfileId) {
      return null;
    }

    const response = await client.profiles.getProfile(normalizedProfileId, {
      fieldsProfile: ["email"],
    });

    return profileEmailFromResponse(response);
  }

  async trackOrderPlaced(order: CommerceRecord, customerEmail: string): Promise<void> {
    const orderId = getString(order, "id");
    const properties = {
      ...commerceProperties(order),
      OrderId: orderId,
      OrderNumber: getNumber(order, "display_id") ?? getString(order, "display_id"),
    };

    await this.trackEvent({
      currency: entityCurrency(order),
      email: customerEmail,
      metric: "Placed Order",
      occurredAt: getString(order, "created_at"),
      properties,
      uniqueId: orderId ? `medusa:placed-order:${orderId}` : undefined,
      value: entityTotal(order),
    });
  }

  async trackOrderShipped(
    order: CommerceRecord,
    fulfillment: CommerceRecord,
    customerEmail: string,
  ): Promise<void> {
    const orderId = getString(order, "id");
    const fulfillmentId = getString(fulfillment, "id");
    const trackingNumber =
      getTrackingValue(fulfillment, "shippo_tracking_number") ??
      getTrackingValue(fulfillment, "tracking_number");
    const trackingUrl =
      getTrackingValue(fulfillment, "shippo_tracking_url") ??
      getTrackingValue(fulfillment, "tracking_url") ??
      getTrackingValue(fulfillment, "tracking_url_provider");
    const properties: Record<string, unknown> = {
      ...commerceProperties(order),
      FulfillmentId: fulfillmentId,
      OrderId: orderId,
      OrderNumber: getNumber(order, "display_id") ?? getString(order, "display_id"),
    };

    if (trackingNumber) {
      properties["TrackingNumber"] = trackingNumber;
    }

    if (trackingUrl) {
      properties["TrackingURL"] = trackingUrl;
    }

    await this.trackEvent({
      currency: entityCurrency(order),
      email: customerEmail,
      metric: "Order Shipped",
      occurredAt: getString(fulfillment, "created_at"),
      properties,
      uniqueId:
        orderId && fulfillmentId ? `medusa:order-shipped:${orderId}:${fulfillmentId}` : undefined,
      value: entityTotal(order),
    });
  }

  async trackOrderCancelled(order: CommerceRecord, customerEmail: string): Promise<void> {
    const orderId = getString(order, "id");
    const metadata = getRecord(order["metadata"]);
    const properties: Record<string, unknown> = {
      ...commerceProperties(order),
      OrderId: orderId,
      OrderNumber: getNumber(order, "display_id") ?? getString(order, "display_id"),
    };
    const reason =
      getString(metadata, "cancellation_reason") ?? getString(metadata, "cancel_reason");

    if (reason) {
      properties["Reason"] = reason;
    }

    await this.trackEvent({
      currency: entityCurrency(order),
      email: customerEmail,
      metric: "Cancelled Order",
      occurredAt: getString(order, "canceled_at") ?? new Date().toISOString(),
      properties,
      uniqueId: orderId ? `medusa:cancelled-order:${orderId}` : undefined,
      value: entityTotal(order),
    });
  }

  async trackStartedCheckout(cart: CommerceRecord, customerEmail: string): Promise<void> {
    const cartId = getString(cart, "id");
    const properties = {
      ...commerceProperties(cart),
      CartId: cartId,
      CheckoutURL: storefrontUrl("/checkout"),
    };

    await this.trackEvent({
      currency: entityCurrency(cart),
      email: customerEmail,
      metric: "Started Checkout",
      properties,
      uniqueId: cartId ? `medusa:started-checkout:${cartId}` : undefined,
      value: entityTotal(cart),
    });
  }
}

export = KlaviyoService;
