import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import SanitySyncHelpers = require("./sanity-sync-helpers");

const { resolveSanitySyncService, runSanitySyncSubscriber } = SanitySyncHelpers;

type ProductEventPayload = {
  id: string;
};

async function sanitySyncProductDeleted({
  container,
  event,
}: SubscriberArgs<ProductEventPayload>): Promise<void> {
  const productId = event.data.id;

  await runSanitySyncSubscriber({
    operation: "delete",
    productId,
    run: async () => {
      const syncService = resolveSanitySyncService(container);

      await syncService.deleteProduct(productId);
    },
  });
}

const config: SubscriberConfig = {
  event: "product.deleted",
};

module.exports = sanitySyncProductDeleted;
module.exports.default = sanitySyncProductDeleted;
module.exports.config = config;
