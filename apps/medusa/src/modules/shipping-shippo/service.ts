import type {
  AddressCreateRequest,
  ParcelCreateRequest,
  Rate,
  ResponseMessage,
  Shippo as ShippoClient,
} from "shippo";
import type { Logger } from "pino";

type LoggerModule = {
  child(scope: string): Logger;
};

type ShippoClientFactory = {
  createShippoClient(): ShippoClient;
};

type GenerateLabelInput = {
  shipFromAddress: AddressCreateRequest;
  shipToAddress: AddressCreateRequest;
  parcel: ParcelCreateRequest;
  metadata?: Record<string, string>;
};

type GenerateLabelResult = {
  labelUrl: string;
  rateId: string;
  status: string;
  trackingNumber: string;
  trackingUrlProvider: string;
  transactionId: string;
};

const { child } = require("../../lib/logger") as LoggerModule;
const { createShippoClient } = require("./client") as ShippoClientFactory;

const logger = child("shipping-shippo");

class ShippoLabelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShippoLabelError";
  }
}

function formatShippoMessages(messages: ResponseMessage[] | undefined): string {
  const formatted = (messages ?? [])
    .map((message) => [message.code, message.text].filter(Boolean).join(": "))
    .filter((message) => message.length > 0);

  return formatted.join("; ");
}

function rateAmount(rate: Rate): number {
  const amount = Number.parseFloat(rate.amount);

  return Number.isFinite(amount) ? amount : Number.POSITIVE_INFINITY;
}

function pickCheapestRate(rates: Rate[]): Rate {
  let cheapest: Rate | null = null;

  for (const rate of rates) {
    if (!cheapest || rateAmount(rate) < rateAmount(cheapest)) {
      cheapest = rate;
    }
  }

  if (!cheapest || rateAmount(cheapest) === Number.POSITIVE_INFINITY) {
    throw new ShippoLabelError("Shippo returned no purchasable shipping rates.");
  }

  return cheapest;
}

function stringifyMetadata(metadata: Record<string, string> | undefined): string | undefined {
  return metadata ? JSON.stringify(metadata) : undefined;
}

class ShippingShippoService {
  private client: ShippoClient | null = null;

  private getClient(): ShippoClient {
    this.client ??= createShippoClient();

    return this.client;
  }

  /** Generate a Shippo PDF label for a Medusa fulfillment. */
  async generateLabel(input: GenerateLabelInput): Promise<GenerateLabelResult> {
    const client = this.getClient();
    const metadata = stringifyMetadata(input.metadata);
    const shipment = await client.shipments.create({
      addressFrom: input.shipFromAddress,
      addressTo: input.shipToAddress,
      async: false,
      parcels: [input.parcel],
      ...(metadata ? { metadata } : {}),
    });

    const cheapest = pickCheapestRate(shipment.rates);
    const transaction = await client.transactions.create({
      async: false,
      labelFileType: "PDF_4x6",
      rate: cheapest.objectId,
      ...(metadata ? { metadata } : {}),
    });

    if (transaction.status !== "SUCCESS") {
      const message = formatShippoMessages(transaction.messages);

      throw new ShippoLabelError(
        `Shippo transaction failed: ${transaction.status ?? "UNKNOWN"}${message ? ` ${message}` : ""}`,
      );
    }

    if (!transaction.labelUrl || !transaction.trackingNumber || !transaction.trackingUrlProvider) {
      throw new ShippoLabelError("Shippo transaction succeeded without label or tracking data.");
    }

    logger.info(
      {
        rateId: cheapest.objectId,
        transactionId: transaction.objectId,
      },
      "Shippo label purchased",
    );

    return {
      labelUrl: transaction.labelUrl,
      rateId: cheapest.objectId,
      status: transaction.status,
      trackingNumber: transaction.trackingNumber,
      trackingUrlProvider: transaction.trackingUrlProvider,
      transactionId: transaction.objectId ?? "",
    };
  }
}

export = ShippingShippoService;
