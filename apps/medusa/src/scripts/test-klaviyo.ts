import type { ExecArgs } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import KlaviyoModule = require("../modules/klaviyo");

const { ContainerRegistrationKeys } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { KLAVIYO_MODULE } = KlaviyoModule;

type KlaviyoService = {
  trackEvent(input: {
    email: string;
    metric: string;
    properties: Record<string, unknown>;
    uniqueId?: string;
  }): Promise<void>;
  upsertProfile(input: { email: string; properties?: Record<string, unknown> }): Promise<void>;
};

async function testKlaviyo({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const service = container.resolve<KlaviyoService>(KLAVIYO_MODULE);
  const unique = Date.now().toString(36);
  const email = `klaviyo-smoke+${unique}@example.com`;

  await service.upsertProfile({
    email,
    properties: {
      smoke_test_id: unique,
      source: "medusa_exec",
    },
  });
  await service.trackEvent({
    email,
    metric: "vaivae Smoke Test",
    properties: {
      smoke_test_id: unique,
      source: "medusa_exec",
    },
    uniqueId: `medusa:klaviyo-smoke:${unique}`,
  });

  logger.info(`Klaviyo smoke test completed for smoke_test_id ${unique}.`);
}

module.exports = testKlaviyo;
module.exports.default = testKlaviyo;
