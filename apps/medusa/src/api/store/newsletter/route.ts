import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { IEventBusModuleService } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import type * as MedusaZod from "@medusajs/framework/zod";
import KlaviyoModule = require("../../../modules/klaviyo");
import MarketingConsentModule = require("../../../modules/marketing-consent");

const { ContainerRegistrationKeys, Modules } =
  require("@medusajs/framework/utils") as typeof MedusaUtils;
const { z } = require("@medusajs/framework/zod") as typeof MedusaZod;
const { KLAVIYO_MODULE } = KlaviyoModule;
const { MARKETING_CONSENT_MODULE } = MarketingConsentModule;

const sourceSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : "newsletter_form"),
  z.string().min(1).max(100),
);

const subscribeSchema = z.object({
  consent: z.literal(true),
  email: z.string().trim().toLowerCase().email(),
  source: sourceSchema,
});

type CustomerDTO = {
  email: string;
  id: string;
};

type CustomerService = {
  createCustomers(input: {
    email: string;
    has_account: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<CustomerDTO>;
  listCustomers(filters: { email: string }, config?: { take?: number }): Promise<CustomerDTO[]>;
};

type ConsentRecordDTO = {
  consented_at: Date | string;
  id: string;
  source: string | null;
  subscribed: boolean;
};

type MarketingConsentService = {
  recordConsent(input: {
    customerId: string;
    email: string;
    ipAddress?: string | null;
    marketingEmailLists?: string[] | null;
    source: string;
    subscribed: boolean;
    userAgent?: string | null;
  }): Promise<ConsentRecordDTO>;
};

type KlaviyoService = {
  setSubscribed(email: string, subscribed: boolean): Promise<void>;
  upsertProfile(input: {
    email: string;
    externalId?: string | null;
    properties?: Record<string, unknown>;
  }): Promise<void>;
};

type LinkService = {
  create(data: Record<string, Record<string, string>>): Promise<unknown>;
};

function getHeaderString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

function getClientIp(req: MedusaRequest): string | null {
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

async function findOrCreateCustomer(
  customerService: CustomerService,
  email: string,
): Promise<CustomerDTO> {
  const existing = await customerService.listCustomers({ email }, { take: 1 });
  const customer = existing[0];

  if (customer) {
    return customer;
  }

  return customerService.createCustomers({
    email,
    has_account: false,
    metadata: {
      newsletter_guest: true,
    },
  });
}

async function linkConsentRecord(
  req: MedusaRequest,
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

async function emitConsentUpdatedEvent(
  req: MedusaRequest,
  customerId: string,
  email: string,
  record: ConsentRecordDTO,
): Promise<void> {
  const eventBus = req.scope.resolve<IEventBusModuleService>(Modules.EVENT_BUS);

  await eventBus.emit({
    name: "marketing-consent.updated",
    data: {
      consentRecordId: record.id,
      consentedAt: toIsoString(record.consented_at),
      customerId,
      email,
      source: record.source,
      subscribed: record.subscribed,
    },
  });
}

async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const parsed = subscribeSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      details: parsed.error.issues,
      error: "invalid_request",
    });
    return;
  }

  const customerService = req.scope.resolve<CustomerService>(Modules.CUSTOMER);
  const consentService = req.scope.resolve<MarketingConsentService>(MARKETING_CONSENT_MODULE);
  const klaviyoService = req.scope.resolve<KlaviyoService>(KLAVIYO_MODULE);
  const customer = await findOrCreateCustomer(customerService, parsed.data.email);
  const record = await consentService.recordConsent({
    customerId: customer.id,
    email: parsed.data.email,
    ipAddress: getClientIp(req),
    marketingEmailLists: ["newsletter"],
    source: parsed.data.source,
    subscribed: true,
    userAgent: getHeaderString(req.headers["user-agent"]),
  });

  await linkConsentRecord(req, customer.id, record.id);
  await emitConsentUpdatedEvent(req, customer.id, parsed.data.email, record);
  await klaviyoService.upsertProfile({
    email: parsed.data.email,
    externalId: customer.id,
    properties: {
      marketing_consent_record_id: record.id,
      marketing_consent_source: record.source,
      marketing_consent_state: "subscribed",
      marketing_consented_at: toIsoString(record.consented_at),
      medusa_customer_id: customer.id,
    },
  });
  await klaviyoService.setSubscribed(parsed.data.email, true);

  res.status(200).json({ ok: true });
}

module.exports.POST = POST;
