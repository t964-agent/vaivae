import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import SanitySyncHelpers = require("./sanity-sync-helpers");

const { runSanitySyncSubscriber, syncProductById } = SanitySyncHelpers;

type ProductEventPayload = {
  id: string;
};

async function sanitySyncProductCreated({
  container,
  event,
}: SubscriberArgs<ProductEventPayload>): Promise<void> {
  const productId = event.data.id;

  await runSanitySyncSubscriber({
    operation: "create",
    productId,
    run: async () => {
      await syncProductById(container, productId);
    },
  });
}

const config: SubscriberConfig = {
  event: "product.created",
};

exports.default = sanitySyncProductCreated;
exports.config = config;
