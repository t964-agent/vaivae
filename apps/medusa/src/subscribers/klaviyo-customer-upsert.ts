import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type * as MedusaUtils from "@medusajs/framework/utils";
import MarketingConsentModule = require("../modules/marketing-consent");
import KlaviyoHelpers = require("./klaviyo-subscriber-helpers");

const { Modules } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { MARKETING_CONSENT_MODULE } = MarketingConsentModule;
const { normalizedEmail, resolveKlaviyoService, runKlaviyoSubscriber } = KlaviyoHelpers;

type CustomerEventPayload = {
  id: string;
};

type CustomerDTO = {
  email: string;
  first_name?: string | null;
  id: string;
  last_name?: string | null;
  phone?: string | null;
};

type ConsentRecordDTO = {
  consented_at: Date | string;
  id: string;
  source: string | null;
  subscribed: boolean;
};

type CustomerService = {
  retrieveCustomer(customerId: string): Promise<CustomerDTO>;
};

type MarketingConsentService = {
  getCurrentConsent(customerId: string): Promise<ConsentRecordDTO | null>;
};

function toIsoString(value: Date | string | null): string | null {
  if (value === null) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : value;
}

async function klaviyoCustomerUpsert({
  container,
  event,
}: SubscriberArgs<CustomerEventPayload>): Promise<void> {
  const customerId = event.data.id;

  await runKlaviyoSubscriber({
    identifiers: { customerId, eventName: event.name },
    operation: "customer-upsert",
    run: async () => {
      const customerService = container.resolve<CustomerService>(Modules.CUSTOMER);
      const consentService = container.resolve<MarketingConsentService>(MARKETING_CONSENT_MODULE);
      const klaviyoService = resolveKlaviyoService(container);
      const customer = await customerService.retrieveCustomer(customerId);
      const email = normalizedEmail(customer.email);

      if (!email) {
        return;
      }

      const consent = await consentService.getCurrentConsent(customerId);
      const consentedAt = consent ? toIsoString(consent.consented_at) : null;

      await klaviyoService.upsertProfile({
        email,
        externalId: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        properties: {
          marketing_consent_record_id: consent?.id ?? null,
          marketing_consent_source: consent?.source ?? null,
          marketing_consent_state: consent?.subscribed ? "subscribed" : "not_subscribed",
          marketing_consented_at: consentedAt,
          medusa_customer_id: customer.id,
        },
      });
    },
  });
}

const config: SubscriberConfig = {
  event: ["customer.created", "customer.updated"],
};

module.exports = klaviyoCustomerUpsert;
module.exports.default = klaviyoCustomerUpsert;
module.exports.config = config;
