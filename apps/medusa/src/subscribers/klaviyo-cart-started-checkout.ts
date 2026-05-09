import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import type * as MedusaUtils from "@medusajs/framework/utils";
import KlaviyoHelpers = require("./klaviyo-subscriber-helpers");

const { Modules } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { normalizedEmail, resolveKlaviyoService, runKlaviyoSubscriber } = KlaviyoHelpers;

type CartUpdatedPayload = {
  id: string;
};

type CartService = {
  retrieveCart(cartId: string, config?: { relations?: string[] }): Promise<Record<string, unknown>>;
  updateCarts(
    cartId: string,
    data: { metadata: Record<string, unknown> },
  ): Promise<Record<string, unknown>>;
};

const startedCheckoutMetadataKey = "klaviyo_started_checkout_at";
const startedCheckoutThrottleMs = 30 * 60 * 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getMetadata(cart: Record<string, unknown>): Record<string, unknown> {
  return isRecord(cart["metadata"]) ? cart["metadata"] : {};
}

function hasLineItems(cart: Record<string, unknown>): boolean {
  const items = cart["items"];

  return Array.isArray(items) && items.length > 0;
}

function recentlySent(metadata: Record<string, unknown>, now: Date): boolean {
  const sentAt = getString(metadata, startedCheckoutMetadataKey);

  if (!sentAt) {
    return false;
  }

  const sentAtDate = new Date(sentAt);

  if (!Number.isFinite(sentAtDate.getTime())) {
    return false;
  }

  return now.getTime() - sentAtDate.getTime() < startedCheckoutThrottleMs;
}

async function klaviyoCartStartedCheckout({
  container,
  event,
}: SubscriberArgs<CartUpdatedPayload>): Promise<void> {
  const cartId = event.data.id;

  await runKlaviyoSubscriber({
    identifiers: { cartId, eventName: event.name },
    operation: "cart-started-checkout",
    run: async () => {
      const cartService = container.resolve<CartService>(Modules.CART);
      const klaviyoService = resolveKlaviyoService(container);
      const cart = await cartService.retrieveCart(cartId, { relations: ["items"] });
      const email = normalizedEmail(getString(cart, "email"));

      if (!email || !hasLineItems(cart)) {
        return;
      }

      const now = new Date();
      const metadata = getMetadata(cart);

      if (recentlySent(metadata, now)) {
        return;
      }

      await klaviyoService.trackStartedCheckout(cart, email);
      await cartService.updateCarts(cartId, {
        metadata: {
          ...metadata,
          [startedCheckoutMetadataKey]: now.toISOString(),
        },
      });
    },
  });
}

const config: SubscriberConfig = {
  event: "cart.updated",
};

module.exports = klaviyoCartStartedCheckout;
module.exports.default = klaviyoCartStartedCheckout;
module.exports.config = config;
