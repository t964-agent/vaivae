import type { ExecArgs } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import SanitySyncModule = require("../modules/sanity-sync");

const { ContainerRegistrationKeys } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { SANITY_SYNC_MODULE } = SanitySyncModule;

type SanitySyncService = {
  syncProduct(product: {
    id: string;
    title: string;
    handle: string;
    materials?: string[] | null;
  }): Promise<void>;
};

async function testSanitySync({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const service = container.resolve<SanitySyncService>(SANITY_SYNC_MODULE);

  await service.syncProduct({
    handle: "test",
    id: "test_prod_001",
    materials: ["silk"],
    title: "Test",
  });

  logger.info("Sanity sync smoke test wrote test_prod_001.");
}

exports.default = testSanitySync;
