import type { InferEntityType } from "@medusajs/framework/types";
import MedusaUtils = require("@medusajs/framework/utils");
import ConsentRecord = require("./models/consent-record");

const { MedusaService } = MedusaUtils;

const SUPPRESSION_RETENTION_DAYS = 30;
const SUPPRESSION_RETENTION_MS = SUPPRESSION_RETENTION_DAYS * 24 * 60 * 60 * 1000;

type ConsentRecordEntity = InferEntityType<typeof ConsentRecord>;

type RecordConsentInput = {
  customerId: string;
  subscribed: boolean;
  source: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  email: string;
  optOutReason?: string | null;
  doubleOptInAt?: Date | null;
  marketingEmailLists?: string[] | null;
};

function trimToNull(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function requireTrimmed(value: string, field: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

function toJsonArray(value: string[] | null | undefined): Record<string, unknown> | null {
  return value ? (value as unknown as Record<string, unknown>) : null;
}

class MarketingConsentService extends MedusaService({
  ConsentRecord,
}) {
  async getCurrentConsent(customerId: string): Promise<ConsentRecordEntity | null> {
    const normalizedCustomerId = customerId.trim();

    if (!normalizedCustomerId) {
      return null;
    }

    const records = await this.listConsentRecords(
      { customer_id: normalizedCustomerId },
      {
        order: {
          consented_at: "DESC",
        },
        take: 1,
      },
    );

    return records[0] ?? null;
  }

  async recordConsent(input: RecordConsentInput): Promise<ConsentRecordEntity> {
    const customerId = requireTrimmed(input.customerId, "customerId");
    const email = requireTrimmed(input.email, "email").toLowerCase();
    const source = requireTrimmed(input.source, "source");
    const now = new Date();
    const expiresAt = input.subscribed ? null : new Date(now.getTime() + SUPPRESSION_RETENTION_MS);

    return this.createConsentRecords({
      customer_id: customerId,
      subscribed: input.subscribed,
      source,
      ip_address: trimToNull(input.ipAddress),
      user_agent: trimToNull(input.userAgent),
      email,
      marketing_email_lists: toJsonArray(input.marketingEmailLists),
      opt_out_reason: input.subscribed ? null : trimToNull(input.optOutReason),
      double_opt_in_at: input.doubleOptInAt ?? null,
      consented_at: now,
      expires_at: expiresAt,
    });
  }

  async isSubscribed(customerId: string): Promise<boolean> {
    const current = await this.getCurrentConsent(customerId);

    return current?.subscribed ?? false;
  }
}

export = MarketingConsentService;
