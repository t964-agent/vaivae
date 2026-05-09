import "server-only";

import { cookies } from "next/headers";

export const CART_COOKIE_NAME = "_vaivae_cart_id";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const cartCookieOptions = {
  httpOnly: true,
  maxAge: CART_COOKIE_MAX_AGE,
  path: "/",
  sameSite: "lax",
  secure: process.env["NODE_ENV"] === "production",
} as const;

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value.trim();

  return cartId || undefined;
}

export async function setCartId(cartId: string): Promise<void> {
  const normalizedCartId = cartId.trim();

  if (!normalizedCartId) {
    throw new Error("Cannot set an empty Medusa cart ID cookie.");
  }

  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, normalizedCartId, cartCookieOptions);
}

export async function clearCartId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, "", {
    ...cartCookieOptions,
    maxAge: 0,
  });
}
