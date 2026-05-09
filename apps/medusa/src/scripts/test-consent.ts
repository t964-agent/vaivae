import type { ExecArgs } from "@medusajs/framework/types";
import MedusaUtils = require("@medusajs/framework/utils");
import MarketingConsentModule = require("../modules/marketing-consent");

const { ContainerRegistrationKeys } = MedusaUtils;
const { MARKETING_CONSENT_MODULE } = MarketingConsentModule;

type ConsentRecordDTO = {
  id: string;
  customer_id: string;
};

type MarketingConsentService = {
  getCurrentConsent(customerId: string): Promise<ConsentRecordDTO | null>;
  recordConsent(input: {
    customerId: string;
    subscribed: boolean;
    source: string;
    email: string;
  }): Promise<ConsentRecordDTO>;
};

async function testConsent({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const service = container.resolve<MarketingConsentService>(MARKETING_CONSENT_MODULE);
  const unique = Date.now().toString(36);
  const record = await service.recordConsent({
    customerId: `cus_test_consent_${unique}`,
    subscribed: true,
    source: "smoke_test",
    email: `smoke+${unique}@example.com`,
  });
  const current = await service.getCurrentConsent(record.customer_id);

  if (!current || current.id !== record.id) {
    throw new Error("Marketing consent smoke test failed to read the latest record.");
  }

  logger.info(`Marketing consent smoke test wrote and read ${record.id}.`);
}

module.exports = testConsent;
module.exports.default = testConsent;
