import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReorderButton } from "@/components/account/reorder-button";
import { Badge, Button, HStack, Stack } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { retrieveOrder } from "@/medusa/customer";
import type { StoreOrder } from "@/medusa/types";

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

type OrderLine = {
  handle: string | null;
  id: string;
  quantity: number;
  thumbnail: string | null;
  title: string;
  total: number | null;
  variant: string | null;
};

type TrackingLink = {
  label: string;
  url: string | null;
};

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Order detail",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getOrderNumber(order: StoreOrder): string {
  return String(order.display_id ?? order.id.slice(-6));
}

function getOrderStatusLabel(status: StoreOrder["status"]): string {
  const normalizedStatus = String(status ?? "pending").replaceAll("_", " ");

  if (normalizedStatus === "completed") {
    return "Delivered";
  }

  if (normalizedStatus === "pending") {
    return "Preparing";
  }

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
}

function getStatusCopy(status: StoreOrder["status"]): string {
  if (status === "completed") {
    return "Your order has been completed.";
  }

  if (status === "canceled") {
    return "This order has been canceled.";
  }

  return "Your order has been received and is being prepared.";
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) {
    return "Date pending";
  }

  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(value));
}

function formatMaybePrice(amount: number | null | undefined, currencyCode: string): string {
  return typeof amount === "number" ? formatPrice(amount, currencyCode) : "Pending";
}

function getVariantDetails(item: Record<string, unknown>): string | null {
  const variant = isRecord(item["variant"]) ? item["variant"] : null;
  const options = variant && Array.isArray(variant["options"]) ? variant["options"] : [];
  const optionLabels = options.flatMap((optionValue) => {
    if (!isRecord(optionValue)) {
      return [];
    }

    const value = getString(optionValue["value"]);

    if (!value) {
      return [];
    }

    const option = isRecord(optionValue["option"]) ? optionValue["option"] : null;
    const optionTitle = getString(option?.["title"]);

    if (!optionTitle || optionTitle.toLowerCase() === "title") {
      return [value];
    }

    return [`${optionTitle}: ${value}`];
  });

  if (optionLabels.length > 0) {
    return optionLabels.join(" / ");
  }

  return (
    getString(item["variant_title"]) ?? getString(variant?.["title"]) ?? getString(item["subtitle"])
  );
}

function getOrderLines(order: StoreOrder): OrderLine[] {
  const record = isRecord(order) ? order : null;
  const items = record && Array.isArray(record["items"]) ? record["items"] : [];

  return items.flatMap((item, index) => {
    if (!isRecord(item)) {
      return [];
    }

    const product = isRecord(item["product"]) ? item["product"] : null;
    const variant = isRecord(item["variant"]) ? item["variant"] : null;
    const id = getString(item["id"]) ?? `item-${index}`;
    const quantity = getNumber(item["quantity"]) ?? 1;
    const unitPrice = getNumber(item["unit_price"]);
    const total =
      getNumber(item["total"]) ??
      getNumber(item["subtotal"]) ??
      (unitPrice ? unitPrice * quantity : null);

    return [
      {
        handle: getString(item["product_handle"]) ?? getString(product?.["handle"]),
        id,
        quantity,
        thumbnail:
          getString(item["thumbnail"]) ??
          getString(variant?.["thumbnail"]) ??
          getString(product?.["thumbnail"]),
        title: getString(item["product_title"]) ?? getString(item["title"]) ?? "Untitled piece",
        total,
        variant: getVariantDetails(item),
      },
    ];
  });
}

function getAddressLines(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }

  const name = [getString(value["first_name"]), getString(value["last_name"])]
    .filter(Boolean)
    .join(" ");
  const cityLine = [
    getString(value["city"]),
    getString(value["province"])?.toUpperCase(),
    getString(value["postal_code"]),
  ]
    .filter(Boolean)
    .join(", ");

  return [
    name,
    getString(value["address_1"]),
    getString(value["address_2"]),
    cityLine,
    getString(value["country_code"])?.toUpperCase() === "US" ? "United States" : null,
    getString(value["phone"]),
  ].filter((line): line is string => Boolean(line));
}

function findCardSummary(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const brand = getString(value["brand"]) ?? getString(value["card_brand"]);
  const last4 = getString(value["last4"]) ?? getString(value["card_last4"]);

  if (brand && last4) {
    return `${brand.toUpperCase()} ending in ${last4}`;
  }

  for (const child of Object.values(value)) {
    const nested = findCardSummary(child);

    if (nested) {
      return nested;
    }
  }

  return null;
}

function getPaymentSummary(order: StoreOrder): string {
  return findCardSummary(order) ?? "Paid securely via Stripe";
}

function getTrackingLinks(order: StoreOrder): TrackingLink[] {
  const record = isRecord(order) ? order : null;
  const fulfillments =
    record && Array.isArray(record["fulfillments"]) ? record["fulfillments"] : [];

  return fulfillments.flatMap((fulfillment) => {
    if (!isRecord(fulfillment)) {
      return [];
    }

    const links = Array.isArray(fulfillment["tracking_links"]) ? fulfillment["tracking_links"] : [];

    return links.flatMap((link, index) => {
      if (!isRecord(link)) {
        return [];
      }

      const trackingNumber = getString(link["tracking_number"]);
      const carrier = getString(link["provider_id"]) ?? getString(link["carrier"]);
      const url = getString(link["url"]);
      const label = [carrier, trackingNumber].filter(Boolean).join(" ") || `Shipment ${index + 1}`;

      return [{ label, url }];
    });
  });
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const order = await retrieveOrder(orderId);

  if (!order) {
    notFound();
  }

  const currencyCode = order.currency_code ?? "usd";
  const lines = getOrderLines(order);
  const shippingAddress = getAddressLines(order.shipping_address);
  const billingAddress = getAddressLines(order.billing_address);
  const trackingLinks = getTrackingLinks(order);

  return (
    <Stack gap={8}>
      <section className="grid gap-5 border border-on-light/10 bg-on-light/[0.025] p-6">
        <HStack gap={3} wrap>
          <Badge>{getOrderStatusLabel(order.status)}</Badge>
          <span className="text-xs tracking-[0.16em] text-on-light/45 uppercase">
            Order #{getOrderNumber(order)}
          </span>
        </HStack>
        <div className="grid gap-2">
          <h2 className="font-display text-5xl leading-none font-light tracking-[-0.05em] text-on-light italic">
            {getStatusCopy(order.status)}
          </h2>
          <p className="text-sm leading-6 text-on-light/60">
            Placed {formatDate(order.created_at)}
          </p>
        </div>
        <HStack gap={3} wrap>
          {trackingLinks.map((link) =>
            link.url ? (
              <Button asChild key={`${link.label}-${link.url}`}>
                <Link href={link.url}>Track shipment</Link>
              </Button>
            ) : (
              <span className="text-sm text-on-light/60" key={link.label}>
                Tracking: {link.label}
              </span>
            ),
          )}
          <ReorderButton orderId={order.id} />
        </HStack>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Stack gap={4}>
          <h3 className="font-body text-xs tracking-[0.18em] text-on-light/45 uppercase">Items</h3>
          <ul className="grid gap-4" aria-label="Order items">
            {lines.map((line) => (
              <li
                className="grid grid-cols-[5rem_1fr] gap-4 border-b border-on-light/10 pb-4"
                key={line.id}
              >
                <div className="size-20 overflow-hidden bg-on-light/5">
                  {line.thumbnail ? (
                    <div
                      aria-label={`${line.title} image`}
                      className="size-full bg-cover bg-center"
                      role="img"
                      style={{ backgroundImage: `url(${JSON.stringify(line.thumbnail)})` }}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[0.6rem] tracking-[0.18em] text-on-light/35 uppercase">
                      Image pending
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <HStack align="start" justify="between">
                    <div className="grid gap-1">
                      <h4 className="font-display text-xl leading-tight font-light tracking-[-0.03em] italic">
                        {line.handle ? (
                          <Link
                            className="underline-offset-4 transition-colors hover:text-oxblood hover:underline"
                            href={`/products/${line.handle}`}
                          >
                            {line.title}
                          </Link>
                        ) : (
                          line.title
                        )}
                      </h4>
                      {line.variant ? (
                        <p className="text-xs leading-5 text-on-light/55">{line.variant}</p>
                      ) : null}
                      <p className="text-xs leading-5 text-on-light/55">Qty {line.quantity}</p>
                    </div>
                    <p className="text-sm text-on-light/75 tabular-nums">
                      {formatMaybePrice(line.total, currencyCode)}
                    </p>
                  </HStack>
                </div>
              </li>
            ))}
          </ul>
        </Stack>

        <Stack gap={4}>
          <section className="grid gap-4 border border-on-light/10 bg-on-light/[0.025] p-5">
            <h3 className="font-body text-xs tracking-[0.18em] text-on-light/45 uppercase">
              Summary
            </h3>
            <dl className="grid gap-2 text-sm text-on-light/65">
              <div className="flex justify-between gap-4">
                <dt>Subtotal</dt>
                <dd>{formatMaybePrice(order.subtotal, currencyCode)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Shipping</dt>
                <dd>{formatMaybePrice(order.shipping_total, currencyCode)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Tax</dt>
                <dd>{formatMaybePrice(order.tax_total, currencyCode)}</dd>
              </div>
              {typeof order.discount_total === "number" && order.discount_total > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt>Discount</dt>
                  <dd>-{formatPrice(order.discount_total, currencyCode)}</dd>
                </div>
              ) : null}
              <div className="mt-2 flex justify-between gap-4 border-t border-on-light/10 pt-3 text-on-light">
                <dt>Total</dt>
                <dd>{formatMaybePrice(order.total, currencyCode)}</dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-4 border border-on-light/10 bg-on-light/[0.025] p-5">
            <h3 className="font-body text-xs tracking-[0.18em] text-on-light/45 uppercase">
              Ship to
            </h3>
            <div className="text-sm leading-6 text-on-light/65">
              {shippingAddress.length > 0 ? (
                shippingAddress.map((line) => <p key={line}>{line}</p>)
              ) : (
                <p>Shipping address pending.</p>
              )}
            </div>
          </section>

          <section className="grid gap-4 border border-on-light/10 bg-on-light/[0.025] p-5">
            <h3 className="font-body text-xs tracking-[0.18em] text-on-light/45 uppercase">
              Billing
            </h3>
            <div className="text-sm leading-6 text-on-light/65">
              {billingAddress.length > 0 ? (
                billingAddress.map((line) => <p key={line}>{line}</p>)
              ) : (
                <p>Billing address pending.</p>
              )}
            </div>
            <p className="text-sm leading-6 text-on-light/65">{getPaymentSummary(order)}</p>
          </section>

          <section className="grid gap-3 border border-on-light/10 bg-on-light/[0.025] p-5">
            <h3 className="font-body text-xs tracking-[0.18em] text-on-light/45 uppercase">
              Returns
            </h3>
            <p className="text-sm leading-6 text-on-light/65">
              Need to return a piece? Email returns@vaivae.com with your order number.
            </p>
            <Button asChild className="w-fit" size="sm" variant="underline">
              <Link
                href={`mailto:returns@vaivae.com?subject=Return request for order #${getOrderNumber(order)}`}
              >
                Email returns
              </Link>
            </Button>
          </section>
        </Stack>
      </div>
    </Stack>
  );
}
