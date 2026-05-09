import type { ExecArgs } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";

const { ContainerRegistrationKeys, Modules } =
  require("@medusajs/framework/utils") as typeof MedusaUtils;

async function seed({ container }: ExecArgs): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  container.resolve(Modules.PRODUCT);
  container.resolve(Modules.REGION);
  container.resolve(Modules.SALES_CHANNEL);

  logger.info("Seed script invoked. Drop 01 seeding will be implemented in Agent 28.");
}

module.exports = seed;
module.exports.default = seed;
