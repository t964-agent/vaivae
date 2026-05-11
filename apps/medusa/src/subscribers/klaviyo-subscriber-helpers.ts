import type { Logger } from "pino";
import type * as MedusaUtils from "@medusajs/framework/utils";
import KlaviyoModule = require("../modules/klaviyo");

type LoggerModule = {
  child(scope: string): Logger;
};

type Container = {
  resolve<T>(key: string): T;
};

type KlaviyoService = {
  setSubscribed(email: string, subscribed: boolean): Promise<void>;
  trackOrderCancelled(order: Record<string, unknown>, customerEmail: string): Promise<void>;
  trackOrderPlaced(order: Record<string, unknown>, customerEmail: string): Promise<void>;
  trackOrderShipped(
    order: Record<string, unknown>,
    fulfillment: Record<string, unknown>,
    customerEmail: string,
  ): Promise<void>;
  trackStartedCheckout(cart: Record<string, unknown>, customerEmail: string): Promise<void>;
  upsertProfile(input: {
    email: string;
    externalId?: string | null | undefined;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
    phone?: string | null | undefined;
    properties?: Record<string, unknown>;
  }): Promise<void>;
};

type RunSubscriberInput = {
  identifiers: Record<string, string | number | boolean | null | undefined>;
  operation: string;
  run(): Promise<void>;
};

type ErrorLogDetails = {
  errorCode?: string;
  errorName?: string;
  statusCode?: number;
};

const { defineFileConfig } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { child } = require("../lib/logger") as LoggerModule;
const { KLAVIYO_MODULE } = KlaviyoModule;

defineFileConfig({ isDisabled: () => true });

const logger = child("klaviyo-subscriber");

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getStringField(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getNumericField(record: Record<string, unknown> | null, key: string): number | null {
  const value = record?.[key];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
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

function resolveKlaviyoService(container: Container): KlaviyoService {
  return container.resolve<KlaviyoService>(KLAVIYO_MODULE);
}

function normalizedEmail(email: string | null | undefined): string | null {
  const normalized = email?.trim().toLowerCase();

  return normalized ? normalized : null;
}

async function runKlaviyoSubscriber(input: RunSubscriberInput): Promise<void> {
  try {
    await input.run();
  } catch (error: unknown) {
    logger.error(
      {
        ...toErrorLogDetails(error),
        ...input.identifiers,
        operation: input.operation,
      },
      "Klaviyo subscriber failed",
    );

    throw error;
  }
}

const exportedHelpers = {
  normalizedEmail,
  resolveKlaviyoService,
  runKlaviyoSubscriber,
};

export = exportedHelpers;
