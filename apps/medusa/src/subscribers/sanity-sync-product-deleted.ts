import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import SanitySyncHelpers = require("./sanity-sync-helpers");

const { deleteProductMirrorById, runSanitySyncSubscriber } = SanitySyncHelpers;

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
      await deleteProductMirrorById(container, productId);
    },
  });
}

const config: SubscriberConfig = {
  event: "product.deleted",
};

exports.default = sanitySyncProductDeleted;
exports.config = config;
