import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import SanitySyncHelpers = require("./sanity-sync-helpers");

const {
  extractMaterials,
  resolveSanitySyncService,
  retrieveProductForSanitySync,
  runSanitySyncSubscriber,
} = SanitySyncHelpers;

type ProductEventPayload = {
  id: string;
};

async function sanitySyncProductUpdated({
  container,
  event,
}: SubscriberArgs<ProductEventPayload>): Promise<void> {
  const productId = event.data.id;

  await runSanitySyncSubscriber({
    operation: "update",
    productId,
    run: async () => {
      const product = await retrieveProductForSanitySync(container, productId);
      const syncService = resolveSanitySyncService(container);

      await syncService.syncProduct({
        handle: product.handle,
        id: product.id,
        materials: extractMaterials(product),
        title: product.title,
      });
    },
  });
}

const config: SubscriberConfig = {
  event: "product.updated",
};

module.exports = sanitySyncProductUpdated;
module.exports.default = sanitySyncProductUpdated;
module.exports.config = config;
