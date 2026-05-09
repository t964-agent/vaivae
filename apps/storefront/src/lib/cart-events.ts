"use client";

import type { StoreCart } from "@/medusa/types";

export const CART_UPDATED_EVENT = "vaivae:cart-updated";

export type CartUpdatedDetail = {
  cart: StoreCart | null;
};

export function dispatchCartUpdated(cart: StoreCart | null): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CartUpdatedDetail>(CART_UPDATED_EVENT, { detail: { cart } }),
  );
}

export function isCartUpdatedEvent(event: Event): event is CustomEvent<CartUpdatedDetail> {
  return event instanceof CustomEvent;
}
