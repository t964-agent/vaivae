import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type { IOrderModuleService } from "@medusajs/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import KlaviyoHelpers = require("./klaviyo-subscriber-helpers");

const { Modules } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { normalizedEmail, resolveKlaviyoService, runKlaviyoSubscriber } = KlaviyoHelpers;

type OrderEventPayload = {
  id: string;
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

async function klaviyoOrderPlaced({
  container,
  event,
}: SubscriberArgs<OrderEventPayload>): Promise<void> {
  const orderId = event.data.id;

  await runKlaviyoSubscriber({
    identifiers: { eventName: event.name, orderId },
    operation: "order-placed",
    run: async () => {
      const orderService = container.resolve<IOrderModuleService>(Modules.ORDER);
      const klaviyoService = resolveKlaviyoService(container);
      const order = await orderService.retrieveOrder(orderId, {
        relations: ["billing_address", "items", "shipping_address"],
      });
      const email = normalizedEmail(order.email);

      if (!email) {
        return;
      }

      await klaviyoService.trackOrderPlaced(toRecord(order), email);
    },
  });
}

const config: SubscriberConfig = {
  event: "order.placed",
};

exports.default = klaviyoOrderPlaced;
exports.config = config;
