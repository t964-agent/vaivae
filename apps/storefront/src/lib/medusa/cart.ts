import "server-only";

import { cache } from "react";

import { clearCartId, getCartId, setCartId } from "@/medusa/cart-cookie";
import { getMedusaClient } from "@/medusa/client";
import { getDefaultRegion } from "@/medusa/regions";
import type { StoreCart } from "@/medusa/types";

export const cartQueryParams = {
  fields:
    "id,email,currency_code,region_id,total,subtotal,item_total,tax_total,shipping_total,discount_total,*items,*items.product,*items.variant,*items.variant.options,*items.variant.options.option,*items.variant.images,*region",
} as const;

function isMissingCartError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 404
  );
}

export async function retrieveCart(id: string): Promise<StoreCart> {
  const { cart } = await getMedusaClient().store.cart.retrieve(id, cartQueryParams);

  return cart;
}

export const getCart = cache(async (): Promise<StoreCart | null> => {
  const cartId = await getCartId();

  if (!cartId) {
    return null;
  }

  try {
    return await retrieveCart(cartId);
  } catch (error) {
    if (isMissingCartError(error)) {
      return null;
    }

    throw error;
  }
});

export async function getOrCreateCart(): Promise<StoreCart> {
  const cartId = await getCartId();

  if (cartId) {
    try {
      return await retrieveCart(cartId);
    } catch (error) {
      if (!isMissingCartError(error)) {
        throw error;
      }

      await clearCartId();
    }
  }

  const region = await getDefaultRegion();
  const { cart } = await getMedusaClient().store.cart.create(
    { region_id: region.id },
    cartQueryParams,
  );

  await setCartId(cart.id);

  return cart;
}
