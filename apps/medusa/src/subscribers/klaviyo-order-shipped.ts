import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type { IFulfillmentModuleService, IOrderModuleService } from "@medusajs/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import KlaviyoHelpers = require("./klaviyo-subscriber-helpers");

const { Modules } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { normalizedEmail, resolveKlaviyoService, runKlaviyoSubscriber } = KlaviyoHelpers;

type OrderFulfillmentCreatedPayload = {
  fulfillment_id: string;
  no_notification?: boolean;
  order_id: string;
};

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

async function klaviyoOrderShipped({
  container,
  event,
}: SubscriberArgs<OrderFulfillmentCreatedPayload>): Promise<void> {
  const fulfillmentId = event.data.fulfillment_id;
  const orderId = event.data.order_id;

  await runKlaviyoSubscriber({
    identifiers: { eventName: event.name, fulfillmentId, orderId },
    operation: "order-shipped",
    run: async () => {
      const fulfillmentService = container.resolve<IFulfillmentModuleService>(Modules.FULFILLMENT);
      const orderService = container.resolve<IOrderModuleService>(Modules.ORDER);
      const klaviyoService = resolveKlaviyoService(container);
      const [fulfillment, order] = await Promise.all([
        fulfillmentService.retrieveFulfillment(fulfillmentId, { relations: ["labels"] }),
        orderService.retrieveOrder(orderId, {
          relations: ["billing_address", "items", "shipping_address"],
        }),
      ]);
      const email = normalizedEmail(order.email);

      if (!email) {
        return;
      }

      await klaviyoService.trackOrderShipped(toRecord(order), toRecord(fulfillment), email);
    },
  });
}

const config: SubscriberConfig = {
  event: "order.fulfillment_created",
};

exports.default = klaviyoOrderShipped;
exports.config = config;
