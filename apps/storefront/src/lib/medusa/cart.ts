import "server-only";

import { cache } from "react";

import { getCartId, setCartId } from "@/medusa/cart-cookie";
import { getMedusaClient } from "@/medusa/client";
import { getDefaultRegion } from "@/medusa/regions";
import type { StoreCart } from "@/medusa/types";

export const cartQueryParams = {
  fields:
    "id,email,currency_code,region_id,total,subtotal,item_total,tax_total,shipping_total,discount_total,*items,*region",
} as const;

export async function retrieveCart(id: string): Promise<StoreCart> {
  const { cart } = await getMedusaClient().store.cart.retrieve(id, cartQueryParams);

  return cart;
}

export const getCart = cache(async (): Promise<StoreCart | null> => {
  const cartId = await getCartId();

  if (!cartId) {
    return null;
  }

  return retrieveCart(cartId);
});

export async function getOrCreateCart(): Promise<StoreCart> {
  const cartId = await getCartId();

  if (cartId) {
    return retrieveCart(cartId);
  }

  const region = await getDefaultRegion();
  const { cart } = await getMedusaClient().store.cart.create(
    { region_id: region.id },
    cartQueryParams,
  );

  await setCartId(cart.id);

  return cart;
}
