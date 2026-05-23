import type * as MedusaUtils from "@medusajs/framework/utils";
import type { Logger } from "pino";
import SanityProductSync = require("../workflows/sanity/sync-product");

const { defineFileConfig } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const {
  deleteProductMirrorById,
  extractMaterials,
  resolveSanitySyncService,
  retrieveProductForSanitySync,
  syncProductById,
} = SanityProductSync;

type LoggerModule = {
  child(scope: string): Logger;
};

type SyncOperation = "create" | "delete" | "update";

type SyncErrorLogDetails = {
  errorCode?: string;
  errorMessage: string;
  statusCode?: number;
};

const { child } = require("../lib/logger") as LoggerModule;

defineFileConfig({ isDisabled: () => true });

const logger = child("sanity-sync-subscriber");
const transientErrorCodes = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "EHOSTUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function getNumericField(record: Record<string, unknown> | null, key: string): number | null {
  const value = record?.[key];

  return typeof value === "number" ? value : null;
}

function getStringField(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getErrorStatusCode(error: unknown): number | null {
  const record = asRecord(error);
  const directStatus = getNumericField(record, "statusCode") ?? getNumericField(record, "status");

  if (directStatus !== null) {
    return directStatus;
  }

  const response = asRecord(record?.["response"]);

  return getNumericField(response, "statusCode") ?? getNumericField(response, "status");
}

function getErrorCode(error: unknown): string | null {
  return getStringField(asRecord(error), "code");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown Sanity sync error.";
}

function isTransientSyncError(error: unknown): boolean {
  const statusCode = getErrorStatusCode(error);

  if (statusCode !== null) {
    return statusCode === 408 || statusCode === 409 || statusCode === 429 || statusCode >= 500;
  }

  const code = getErrorCode(error);

  return code ? transientErrorCodes.has(code) : false;
}

function toErrorLogDetails(error: unknown): SyncErrorLogDetails {
  const details: SyncErrorLogDetails = {
    errorMessage: getErrorMessage(error),
  };
  const errorCode = getErrorCode(error);
  const statusCode = getErrorStatusCode(error);

  if (errorCode) {
    details.errorCode = errorCode;
  }

  if (statusCode !== null) {
    details.statusCode = statusCode;
  }

  return details;
}

async function runSanitySyncSubscriber(input: {
  operation: SyncOperation;
  productId: string;
  run(): Promise<void>;
}): Promise<void> {
  try {
    await input.run();
  } catch (error: unknown) {
    const transient = isTransientSyncError(error);

    logger.error(
      {
        ...toErrorLogDetails(error),
        operation: input.operation,
        productId: input.productId,
        transient,
      },
      "Sanity product sync failed",
    );

    if (transient) {
      throw error;
    }
  }
}

const exportedHelpers = {
  deleteProductMirrorById,
  extractMaterials,
  resolveSanitySyncService,
  retrieveProductForSanitySync,
  runSanitySyncSubscriber,
  syncProductById,
};

export = exportedHelpers;
