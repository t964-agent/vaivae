import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type * as MedusaUtils from "@medusajs/framework/utils";
import KlaviyoHelpers = require("./klaviyo-subscriber-helpers");

const { Modules } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { normalizedEmail, resolveKlaviyoService, runKlaviyoSubscriber } = KlaviyoHelpers;

type MarketingConsentUpdatedPayload = {
  consentRecordId: string;
  consentedAt: string | null;
  customerId: string;
  email?: string;
  source: string | null;
  subscribed: boolean;
};

type CustomerDTO = {
  email: string;
  id: string;
};

type CustomerService = {
  retrieveCustomer(customerId: string): Promise<CustomerDTO>;
};

async function klaviyoConsentSync({
  container,
  event,
}: SubscriberArgs<MarketingConsentUpdatedPayload>): Promise<void> {
  const { consentRecordId, customerId, subscribed } = event.data;

  await runKlaviyoSubscriber({
    identifiers: { consentRecordId, customerId, eventName: event.name },
    operation: "consent-sync",
    run: async () => {
      const customerService = container.resolve<CustomerService>(Modules.CUSTOMER);
      const klaviyoService = resolveKlaviyoService(container);
      const emailFromEvent = normalizedEmail(event.data.email);
      const customer = emailFromEvent ? null : await customerService.retrieveCustomer(customerId);
      const email = emailFromEvent ?? normalizedEmail(customer?.email);

      if (!email) {
        return;
      }

      await klaviyoService.upsertProfile({
        email,
        externalId: customerId,
        properties: {
          marketing_consent_record_id: consentRecordId,
          marketing_consent_source: event.data.source,
          marketing_consent_state: subscribed ? "subscribed" : "unsubscribed",
          marketing_consented_at: event.data.consentedAt,
          medusa_customer_id: customerId,
        },
      });
      await klaviyoService.setSubscribed(email, subscribed);
    },
  });
}

const config: SubscriberConfig = {
  event: "marketing-consent.updated",
};

module.exports = klaviyoConsentSync;
module.exports.default = klaviyoConsentSync;
module.exports.config = config;
