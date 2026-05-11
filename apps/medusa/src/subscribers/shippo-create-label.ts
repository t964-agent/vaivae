import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type {
  IFulfillmentModuleService,
  IOrderModuleService,
  OrderAddressDTO,
} from "@medusajs/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import type { AddressCreateRequest, ParcelCreateRequest } from "shippo";
import type { Logger } from "pino";
import ShippingShippoModule = require("../modules/shipping-shippo");

const { Modules } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { SHIPPING_SHIPPO_MODULE } = ShippingShippoModule;

type ShippoBrandAddressModule = {
  getShippoBrandAddress(): AddressCreateRequest;
};

type LoggerModule = {
  child(scope: string): Logger;
};

type OrderFulfillmentCreatedPayload = {
  fulfillment_id: string;
  no_notification?: boolean;
  order_id: string;
};

type ShippoLabelResult = {
  labelUrl: string;
  rateId: string;
  status: string;
  trackingNumber: string;
  trackingUrlProvider: string;
  transactionId: string;
};

type ShippingShippoService = {
  generateLabel(input: {
    shipFromAddress: AddressCreateRequest;
    shipToAddress: AddressCreateRequest;
    parcel: ParcelCreateRequest;
    metadata?: Record<string, string>;
  }): Promise<ShippoLabelResult>;
};

type ErrorLogDetails = {
  errorCode?: string;
  errorName?: string;
  statusCode?: number;
};

const { child } = require("../lib/logger") as LoggerModule;
const { getShippoBrandAddress } =
  require("../modules/shipping-shippo/brand-address") as ShippoBrandAddressModule;

const logger = child("shippo-create-label");
const standardLuxuryGarmentParcel: ParcelCreateRequest = {
  distanceUnit: "in",
  height: "4",
  length: "12",
  massUnit: "oz",
  weight: "16",
  width: "10",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getStringField(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumericField(record: Record<string, unknown> | null, key: string): number | null {
  const value = record?.[key];

  return typeof value === "number" ? value : null;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown Shippo label error.";
}

function toErrorLogDetails(error: unknown): ErrorLogDetails {
  const record = asRecord(error);
  const response = asRecord(record?.["response"]);
  const details: ErrorLogDetails = {};
  const errorCode = getStringField(record, "code");
  const statusCode =
    getNumericField(record, "statusCode") ??
    getNumericField(record, "status") ??
    getNumericField(response, "statusCode") ??
    getNumericField(response, "status");

  if (error instanceof Error) {
    details.errorName = error.name;
  }

  if (errorCode) {
    details.errorCode = errorCode;
  }

  if (statusCode !== null) {
    details.statusCode = statusCode;
  }

  return details;
}

function requireTrimmed(value: string | undefined, field: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`${field} is required for Shippo label generation.`);
  }

  return normalized;
}

function optionalTrimmed(value: string | undefined): string | undefined {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

function mapAddressForShippo(
  address: OrderAddressDTO,
  orderEmail: string | undefined,
): AddressCreateRequest {
  const firstName = optionalTrimmed(address.first_name);
  const lastName = optionalTrimmed(address.last_name);
  const company = optionalTrimmed(address.company);
  const name = [firstName, lastName].filter(Boolean).join(" ") || company;
  const mapped: AddressCreateRequest = {
    city: requireTrimmed(address.city, "shipping_address.city"),
    country: requireTrimmed(address.country_code, "shipping_address.country_code").toUpperCase(),
    name: requireTrimmed(name, "shipping_address.name"),
    state: requireTrimmed(address.province, "shipping_address.province").toUpperCase(),
    street1: requireTrimmed(address.address_1, "shipping_address.address_1"),
    zip: requireTrimmed(address.postal_code, "shipping_address.postal_code"),
  };
  const street2 = optionalTrimmed(address.address_2);
  const phone = optionalTrimmed(address.phone);
  const email = optionalTrimmed(orderEmail);

  return {
    ...mapped,
    ...(company ? { company } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(street2 ? { street2 } : {}),
  };
}

async function shippoCreateLabel({
  container,
  event,
}: SubscriberArgs<OrderFulfillmentCreatedPayload>): Promise<void> {
  const fulfillmentId = event.data.fulfillment_id;
  const orderId = event.data.order_id;
  const fulfillmentService = container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT);
  const fulfillment = await fulfillmentService.retrieveFulfillment(fulfillmentId, {
    relations: ["labels"],
  });
  const existingLabelUrl = getStringField(fulfillment.metadata, "shippo_label_url");

  if (existingLabelUrl) {
    logger.info({ fulfillmentId, orderId }, "Fulfillment already has a Shippo label, skipping");
    return;
  }

  try {
    const orderService = container.resolve<IOrderModuleService>(Modules.ORDER);
    const shippoService = container.resolve<ShippingShippoService>(SHIPPING_SHIPPO_MODULE);
    const order = await orderService.retrieveOrder(orderId, {
      relations: ["shipping_address"],
    });

    if (!order.shipping_address) {
      throw new Error("Order shipping address is required for Shippo label generation.");
    }

    const result = await shippoService.generateLabel({
      metadata: {
        fulfillment_id: fulfillmentId,
        order_id: order.id,
      },
      parcel: standardLuxuryGarmentParcel,
      shipFromAddress: getShippoBrandAddress(),
      shipToAddress: mapAddressForShippo(order.shipping_address, order.email),
    });

    await fulfillmentService.updateFulfillment(fulfillmentId, {
      metadata: {
        ...(fulfillment.metadata ?? {}),
        shippo_label_url: result.labelUrl,
        shippo_rate_id: result.rateId,
        shippo_status: result.status,
        shippo_tracking_number: result.trackingNumber,
        shippo_tracking_url: result.trackingUrlProvider,
        shippo_transaction_id: result.transactionId,
      },
    });

    logger.info(
      {
        fulfillmentId,
        orderId,
        trackingNumber: result.trackingNumber,
      },
      "Shippo label generated for fulfillment",
    );
  } catch (error: unknown) {
    await fulfillmentService.updateFulfillment(fulfillmentId, {
      metadata: {
        ...(fulfillment.metadata ?? {}),
        shippo_error: errorMessage(error),
        shippo_failed_at: new Date().toISOString(),
      },
    });

    logger.error(
      {
        ...toErrorLogDetails(error),
        fulfillmentId,
        orderId,
      },
      "Shippo label generation failed",
    );

    throw error;
  }
}

const config: SubscriberConfig = {
  event: "order.fulfillment_created",
};

exports.default = shippoCreateLabel;
exports.config = config;
