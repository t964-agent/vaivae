import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { ICustomerModuleService, IEventBusModuleService } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import type * as MedusaZod from "@medusajs/framework/zod";
import MarketingConsentModule = require("../../../../../modules/marketing-consent");

const { ContainerRegistrationKeys, Modules } =
  require("@medusajs/framework/utils") as typeof MedusaUtils;
const { z } = require("@medusajs/framework/zod") as typeof MedusaZod;

const { MARKETING_CONSENT_MODULE } = MarketingConsentModule;

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.string().min(1).max(500).optional(),
);

const updateMarketingConsentSchema = z.object({
  optOutReason: optionalTrimmedString,
  source: optionalTrimmedString,
  subscribed: z.boolean(),
});

type ConsentRecordDTO = {
  id: string;
  customer_id: string;
  subscribed: boolean;
  source: string | null;
  email: string;
  marketing_email_lists: unknown | null;
  opt_out_reason: string | null;
  double_opt_in_at: Date | string | null;
  consented_at: Date | string;
  expires_at: Date | string | null;
};

type RecordConsentInput = {
  customerId: string;
  subscribed: boolean;
  source: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  email: string;
  optOutReason?: string | null;
};

type MarketingConsentService = {
  getCurrentConsent(customerId: string): Promise<ConsentRecordDTO | null>;
  recordConsent(input: RecordConsentInput): Promise<ConsentRecordDTO>;
};

type LinkService = {
  create(data: Record<string, Record<string, string>>): Promise<unknown>;
};

type MarketingConsentResponse = {
  id: string;
  customerId: string;
  subscribed: boolean;
  source: string | null;
  marketingEmailLists: string[];
  optOutReason: string | null;
  doubleOptInAt: string | null;
  consentedAt: string;
  expiresAt: string | null;
};

function getHeaderString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

function getClientIp(req: AuthenticatedMedusaRequest): string | null {
  const forwardedFor = getHeaderString(req.headers["x-forwarded-for"]);
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim() || null;

  return firstForwardedIp ?? req.socket.remoteAddress ?? null;
}

function toIsoString(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function toMarketingConsentResponse(record: ConsentRecordDTO): MarketingConsentResponse {
  return {
    id: record.id,
    customerId: record.customer_id,
    subscribed: record.subscribed,
    source: record.source,
    marketingEmailLists: toStringArray(record.marketing_email_lists),
    optOutReason: record.opt_out_reason,
    doubleOptInAt: toIsoString(record.double_opt_in_at),
    consentedAt: toIsoString(record.consented_at) ?? new Date(0).toISOString(),
    expiresAt: toIsoString(record.expires_at),
  };
}

function getCustomerId(req: AuthenticatedMedusaRequest): string | null {
  if (req.auth_context.actor_type !== "customer") {
    return null;
  }

  return req.auth_context.actor_id?.trim() || null;
}

async function linkConsentRecord(
  req: AuthenticatedMedusaRequest,
  customerId: string,
  consentRecordId: string,
): Promise<void> {
  const link = req.scope.resolve<LinkService>(ContainerRegistrationKeys.LINK);

  await link.create({
    [Modules.CUSTOMER]: {
      customer_id: customerId,
    },
    [MARKETING_CONSENT_MODULE]: {
      consent_record_id: consentRecordId,
    },
  });
}

async function getCustomerEmail(
  req: AuthenticatedMedusaRequest,
  customerId: string,
): Promise<string> {
  const customerService = req.scope.resolve<ICustomerModuleService>(Modules.CUSTOMER);
  const customer = await customerService.retrieveCustomer(customerId);
  const email = customer.email.trim();

  if (!email) {
    throw new Error("Customer email is required to record marketing consent.");
  }

  return email;
}

async function emitConsentUpdatedEvent(
  req: AuthenticatedMedusaRequest,
  record: ConsentRecordDTO,
): Promise<void> {
  const eventBus = req.scope.resolve<IEventBusModuleService>(Modules.EVENT_BUS);

  await eventBus.emit({
    name: "marketing-consent.updated",
    data: {
      consentRecordId: record.id,
      consentedAt: toIsoString(record.consented_at),
      customerId: record.customer_id,
      email: record.email,
      source: record.source,
      subscribed: record.subscribed,
    },
  });
}

async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse): Promise<void> {
  const customerId = getCustomerId(req);

  if (!customerId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const service = req.scope.resolve<MarketingConsentService>(MARKETING_CONSENT_MODULE);
  const current = await service.getCurrentConsent(customerId);

  res.status(200).json({
    marketing_consent: current ? toMarketingConsentResponse(current) : null,
    ok: true,
  });
}

async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse): Promise<void> {
  const customerId = getCustomerId(req);

  if (!customerId) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const parsed = updateMarketingConsentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      details: parsed.error.issues,
      error: "invalid_request",
    });
    return;
  }

  const service = req.scope.resolve<MarketingConsentService>(MARKETING_CONSENT_MODULE);
  const email = await getCustomerEmail(req, customerId);
  const record = await service.recordConsent({
    customerId,
    subscribed: parsed.data.subscribed,
    source: parsed.data.source ?? "account_settings",
    ipAddress: getClientIp(req),
    userAgent: getHeaderString(req.headers["user-agent"]),
    email,
    optOutReason: parsed.data.optOutReason ?? null,
  });

  await linkConsentRecord(req, customerId, record.id);
  await emitConsentUpdatedEvent(req, record);

  res.status(200).json({
    marketing_consent: toMarketingConsentResponse(record),
    ok: true,
  });
}

module.exports.GET = GET;
module.exports.POST = POST;
