import type * as NodeCrypto from "node:crypto";
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type * as MedusaUtils from "@medusajs/framework/utils";
import type { MedusaEnv } from "../../../../lib/env";
import KlaviyoModule = require("../../../../modules/klaviyo");
import MarketingConsentModule = require("../../../../modules/marketing-consent");

const { createHmac, timingSafeEqual } = require("node:crypto") as typeof NodeCrypto;
const { ContainerRegistrationKeys, Modules } =
  require("@medusajs/framework/utils") as typeof MedusaUtils;
const { env } = require("../../../../lib/env") as {
  env: Pick<MedusaEnv, "KLAVIYO_WEBHOOK_SECRET">;
};
const { KLAVIYO_MODULE } = KlaviyoModule;
const { MARKETING_CONSENT_MODULE } = MarketingConsentModule;

type RawBodyRequest = MedusaRequest & {
  rawBody?: Buffer | string;
};

type CustomerDTO = {
  email: string;
  id: string;
};

type CustomerService = {
  listCustomers(filters: { email: string }, config?: { take?: number }): Promise<CustomerDTO[]>;
};

type ConsentRecordDTO = {
  id: string;
};

type MarketingConsentService = {
  recordConsent(input: {
    customerId: string;
    email: string;
    optOutReason?: string | null;
    source: string;
    subscribed: boolean;
  }): Promise<ConsentRecordDTO>;
};

type KlaviyoService = {
  getProfileEmail(profileId: string): Promise<string | null>;
};

type LinkService = {
  create(data: Record<string, Record<string, string>>): Promise<unknown>;
};

type WebhookEvent = {
  email: string | null;
  profileId: string | null;
  reason: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getRecord(value: unknown, key: string): Record<string, unknown> | null {
  const record = isRecord(value) ? value : null;
  const next = record?.[key];

  return isRecord(next) ? next : null;
}

function getString(value: unknown, key: string): string | null {
  const record = isRecord(value) ? value : null;
  const next = record?.[key];

  return typeof next === "string" && next.trim() ? next.trim() : null;
}

function getArrayRecords(value: unknown, key: string): Array<Record<string, unknown>> {
  const record = isRecord(value) ? value : null;
  const next = record?.[key];

  return Array.isArray(next) ? next.filter(isRecord) : [];
}

function getHeaderString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

function rawBodyBuffer(req: RawBodyRequest): Buffer | null {
  if (Buffer.isBuffer(req.rawBody)) {
    return req.rawBody;
  }

  if (typeof req.rawBody === "string") {
    return Buffer.from(req.rawBody, "utf8");
  }

  return null;
}

function verifySignature(input: {
  rawBody: Buffer;
  secret: string;
  signature: string | null;
  timestamp: string | null;
}): boolean {
  if (!input.signature || !input.timestamp) {
    return false;
  }

  const expected = createHmac("sha256", input.secret)
    .update(input.rawBody)
    .update(input.timestamp, "utf8")
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(input.signature, "hex");

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function normalizeEmail(email: string | null): string | null {
  const normalized = email?.trim().toLowerCase();

  return normalized ? normalized : null;
}

function reasonForTopic(topic: string): string | null {
  if (topic.includes("bounced_email")) {
    return "hard_bounce";
  }

  if (topic.includes("marked_email_as_spam")) {
    return "spam_complaint";
  }

  if (topic.includes("unsubscribed_from_email_marketing")) {
    return "unsubscribe";
  }

  if (topic.includes("manually_suppressed_from_email_marketing")) {
    return "manual_suppression";
  }

  if (topic.includes("dropped_email")) {
    return "dropped_email";
  }

  return null;
}

function extractEmail(event: Record<string, unknown>): string | null {
  const payload = getRecord(event, "payload");
  const data = getRecord(payload, "data");
  const attributes = getRecord(data, "attributes");
  const eventProperties = getRecord(attributes, "event_properties");
  const profile = getRecord(data, "profile");
  const profileAttributes = getRecord(profile, "attributes");

  return normalizeEmail(
    getString(eventProperties, "email") ??
      getString(eventProperties, "$email") ??
      getString(eventProperties, "Email") ??
      getString(profileAttributes, "email"),
  );
}

function extractProfileId(event: Record<string, unknown>): string | null {
  const payload = getRecord(event, "payload");
  const data = getRecord(payload, "data");
  const relationships = getRecord(data, "relationships");
  const profile = getRecord(relationships, "profile");
  const profileData = getRecord(profile, "data");

  return getString(profileData, "id");
}

function extractWebhookEvents(body: unknown): WebhookEvent[] {
  return getArrayRecords(body, "data").flatMap((event) => {
    const topic = getString(event, "topic");
    const reason = topic ? reasonForTopic(topic) : null;

    if (!reason) {
      return [];
    }

    return [
      {
        email: extractEmail(event),
        profileId: extractProfileId(event),
        reason,
      },
    ];
  });
}

function verifyWebhookId(body: unknown, webhookIdHeader: string | null): boolean {
  if (!webhookIdHeader) {
    return true;
  }

  const meta = getRecord(body, "meta");
  const webhookId = getString(meta, "klaviyo_webhook_id");

  return !webhookId || webhookId === webhookIdHeader;
}

async function resolveEventEmail(
  klaviyoService: KlaviyoService,
  event: WebhookEvent,
): Promise<string | null> {
  if (event.email) {
    return event.email;
  }

  return event.profileId ? klaviyoService.getProfileEmail(event.profileId) : null;
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

async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  if (!env.KLAVIYO_WEBHOOK_SECRET) {
    res.status(503).json({ error: "webhook_not_configured" });
    return;
  }

  const rawBody = rawBodyBuffer(req as RawBodyRequest);

  if (!rawBody) {
    res.status(400).json({ error: "raw_body_required" });
    return;
  }

  const signature = getHeaderString(req.headers["klaviyo-signature"]);
  const timestamp = getHeaderString(req.headers["klaviyo-timestamp"]);

  if (!verifySignature({ rawBody, secret: env.KLAVIYO_WEBHOOK_SECRET, signature, timestamp })) {
    res.status(401).json({ error: "invalid_signature" });
    return;
  }

  const body = JSON.parse(rawBody.toString("utf8")) as unknown;
  const webhookIdHeader = getHeaderString(req.headers["klaviyo-webhook-id"]);

  if (!verifyWebhookId(body, webhookIdHeader)) {
    res.status(400).json({ error: "webhook_id_mismatch" });
    return;
  }

  const customerService = req.scope.resolve<CustomerService>(Modules.CUSTOMER);
  const consentService = req.scope.resolve<MarketingConsentService>(MARKETING_CONSENT_MODULE);
  const klaviyoService = req.scope.resolve<KlaviyoService>(KLAVIYO_MODULE);
  const events = extractWebhookEvents(body);

  for (const event of events) {
    const email = await resolveEventEmail(klaviyoService, event);

    if (!email) {
      continue;
    }

    const customers = await customerService.listCustomers({ email }, { take: 1 });
    const customer = customers[0];

    if (!customer) {
      continue;
    }

    const record = await consentService.recordConsent({
      customerId: customer.id,
      email,
      optOutReason: event.reason,
      source: "klaviyo_webhook",
      subscribed: false,
    });

    await linkConsentRecord(req, customer.id, record.id);
  }

  res.status(200).json({ ok: true });
}

module.exports.POST = POST;
