"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { cartQueryParams, getOrCreateCart, retrieveCart } from "@/medusa/cart";
import { clearCartId, getCartId, setCartId } from "@/medusa/cart-cookie";
import { getMedusaClient } from "@/medusa/client";
import type { StoreCart } from "@/medusa/types";

const quantitySchema = z.coerce.number().int().positive().max(99);

const addLineItemSchema = z.object({
  quantity: quantitySchema,
  variantId: z.string().trim().min(1, "Variant ID is required."),
});

const updateLineItemSchema = z.object({
  lineItemId: z.string().trim().min(1, "Line item ID is required."),
  quantity: quantitySchema,
});

const removeLineItemSchema = z.object({
  lineItemId: z.string().trim().min(1, "Line item ID is required."),
});

type AddLineItemInput = z.input<typeof addLineItemSchema>;
type UpdateLineItemInput = z.input<typeof updateLineItemSchema>;
type RemoveLineItemInput = z.input<typeof removeLineItemSchema>;

export type CartActionResult = { cart: StoreCart | null; ok: true } | { error: string; ok: false };

function getValidationError(error: z.ZodError): CartActionResult {
  return { error: error.issues[0]?.message ?? "Invalid cart input.", ok: false };
}

function getActionError(error: unknown): CartActionResult {
  if (error instanceof Error && error.message.trim()) {
    return { error: error.message, ok: false };
  }

  return { error: "Unable to update cart.", ok: false };
}

function revalidateCart(): void {
  revalidateTag("cart", { expire: 0 });
}

async function getExistingCartId(): Promise<string | undefined> {
  await headers();

  return getCartId();
}

export async function addLineItemAction(input: AddLineItemInput): Promise<CartActionResult> {
  await headers();

  const parsed = addLineItemSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const cart = await getOrCreateCart();
    const { cart: updatedCart } = await getMedusaClient().store.cart.createLineItem(
      cart.id,
      {
        quantity: parsed.data.quantity,
        variant_id: parsed.data.variantId,
      },
      cartQueryParams,
    );

    await setCartId(updatedCart.id);
    revalidateCart();

    return { cart: updatedCart, ok: true };
  } catch (error) {
    return getActionError(error);
  }
}

export async function updateLineItemAction(input: UpdateLineItemInput): Promise<CartActionResult> {
  const parsed = updateLineItemSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const cartId = await getExistingCartId();

    if (!cartId) {
      return { error: "No active cart found.", ok: false };
    }

    const { cart } = await getMedusaClient().store.cart.updateLineItem(
      cartId,
      parsed.data.lineItemId,
      { quantity: parsed.data.quantity },
      cartQueryParams,
    );

    await setCartId(cart.id);
    revalidateCart();

    return { cart, ok: true };
  } catch (error) {
    return getActionError(error);
  }
}

export async function removeLineItemAction(input: RemoveLineItemInput): Promise<CartActionResult> {
  const parsed = removeLineItemSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const cartId = await getExistingCartId();

    if (!cartId) {
      return { error: "No active cart found.", ok: false };
    }

    const { parent } = await getMedusaClient().store.cart.deleteLineItem(
      cartId,
      parsed.data.lineItemId,
      cartQueryParams,
    );
    const cart = parent ?? (await retrieveCart(cartId));

    await setCartId(cart.id);
    revalidateCart();

    return { cart, ok: true };
  } catch (error) {
    return getActionError(error);
  }
}

export async function clearCartAction(): Promise<CartActionResult> {
  await headers();

  try {
    const cartId = await getCartId();

    if (!cartId) {
      await clearCartId();
      revalidateCart();

      return { cart: null, ok: true };
    }

    const cart = await retrieveCart(cartId);
    let updatedCart = cart;

    for (const item of cart.items ?? []) {
      if (!item.id) {
        continue;
      }

      const { parent } = await getMedusaClient().store.cart.deleteLineItem(
        cartId,
        item.id,
        cartQueryParams,
      );
      updatedCart = parent ?? updatedCart;
    }

    await clearCartId();
    revalidateCart();

    return { cart: updatedCart, ok: true };
  } catch (error) {
    return getActionError(error);
  }
}
