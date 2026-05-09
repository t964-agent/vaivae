import "server-only";

import { cache } from "react";

import { getAuthToken } from "@/medusa/auth-cookie";
import { getOrCreateCart } from "@/medusa/cart";
import { getCustomerAuthHeaders } from "@/medusa/customer";
import type { StoreProductVariant } from "@/medusa/types";
import { getPublicEnv } from "@/lib/env";

export type WishlistItem = {
  created_at: string | null;
  id: string;
  product_id: string | null;
  product_variant: StoreProductVariant | null;
  product_variant_id: string;
  updated_at: string | null;
  wishlist_id: string;
};

type Wishlist = {
  id: string;
  items: WishlistItem[];
  items_count: number;
  sales_channel_id: string | null;
};

type WishlistRequestOptions = {
  body?: Record<string, unknown> | undefined;
  method?: "DELETE" | "GET" | "POST" | "PUT" | undefined;
  token?: string | undefined;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getProductIdFromVariant(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  return (
    getString(value["product_id"]) ??
    getString(isRecord(value["product"]) ? value["product"]["id"] : null)
  );
}

function parseWishlistItem(value: unknown): WishlistItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const productVariant = isRecord(value["product_variant"])
    ? (value["product_variant"] as unknown as StoreProductVariant)
    : null;
  const id = getString(value["id"]);
  const wishlistId = getString(value["wishlist_id"]);
  const variantId = getString(value["product_variant_id"]) ?? productVariant?.id ?? null;

  if (!id || !wishlistId || !variantId) {
    return null;
  }

  return {
    created_at: getString(value["created_at"]),
    id,
    product_id: getString(value["product_id"]) ?? getProductIdFromVariant(productVariant),
    product_variant: productVariant,
    product_variant_id: variantId,
    updated_at: getString(value["updated_at"]),
    wishlist_id: wishlistId,
  };
}

function parseWishlist(value: unknown): Wishlist | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = getString(value["id"]);

  if (!id) {
    return null;
  }

  const rawItems = Array.isArray(value["items"]) ? value["items"] : [];

  return {
    id,
    items: rawItems.flatMap((item) => {
      const parsed = parseWishlistItem(item);

      return parsed ? [parsed] : [];
    }),
    items_count: getNumber(value["items_count"]) ?? rawItems.length,
    sales_channel_id: getString(value["sales_channel_id"]),
  };
}

function parseWishlistList(value: unknown): Wishlist[] {
  if (!isRecord(value) || !Array.isArray(value["data"])) {
    return [];
  }

  return value["data"].flatMap((wishlist) => {
    const parsed = parseWishlist(wishlist);

    return parsed ? [parsed] : [];
  });
}

function parseWishlistItemsResponse(value: unknown): WishlistItem[] {
  if (!isRecord(value) || !Array.isArray(value["data"])) {
    return [];
  }

  return value["data"].flatMap((item) => {
    const parsed = parseWishlistItem(item);

    return parsed ? [parsed] : [];
  });
}

function getWishlistBaseUrl(): string {
  return getPublicEnv().NEXT_PUBLIC_MEDUSA_BACKEND_URL.replace(/\/+$/, "");
}

async function requestWishlist(
  path: string,
  options: WishlistRequestOptions = {},
): Promise<unknown> {
  const { NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY } = getPublicEnv();
  const headers = new Headers({
    accept: "application/json",
    "x-publishable-api-key": NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  });

  if (options.body) {
    headers.set("content-type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", getCustomerAuthHeaders(options.token).Authorization);
  }

  const init: RequestInit = {
    cache: "no-store",
    headers,
    method: options.method ?? "GET",
  };

  if (options.body) {
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${getWishlistBaseUrl()}${path}`, init);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Wishlist request failed with status ${response.status}.`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  return contentType.includes("application/json") ? response.json() : null;
}

function requireWishlistToken(token: string | undefined): string {
  if (!token) {
    throw new Error("Sign in to update your wishlist.");
  }

  return token;
}

async function getDefaultSalesChannelId(): Promise<string> {
  const cart = await getOrCreateCart();
  const salesChannelId = isRecord(cart) ? getString(cart["sales_channel_id"]) : null;

  if (!salesChannelId) {
    throw new Error("A storefront sales channel is required before creating a wishlist.");
  }

  return salesChannelId;
}

async function listCustomerWishlists(token: string): Promise<Wishlist[]> {
  const data = await requestWishlist("/store/wishlists?limit=10&offset=0", { token });

  return parseWishlistList(data);
}

async function listWishlistItems(wishlistId: string, token: string): Promise<WishlistItem[]> {
  const data = await requestWishlist(
    `/store/wishlists/${encodeURIComponent(wishlistId)}/items?limit=100&offset=0`,
    { token },
  );

  return parseWishlistItemsResponse(data);
}

async function createWishlist(token: string): Promise<Wishlist> {
  const salesChannelId = await getDefaultSalesChannelId();
  const data = await requestWishlist("/store/wishlists", {
    body: {
      name: "Wishlist",
      sales_channel_id: salesChannelId,
    },
    method: "POST",
    token,
  });
  const wishlist = parseWishlist(data);

  if (!wishlist) {
    throw new Error("Medusa did not return a wishlist.");
  }

  return wishlist;
}

async function getCurrentWishlist(token: string): Promise<Wishlist | null> {
  return (await listCustomerWishlists(token))[0] ?? null;
}

async function getOrCreateWishlist(token: string): Promise<Wishlist> {
  return (await getCurrentWishlist(token)) ?? createWishlist(token);
}

export const getWishlist = cache(async (): Promise<WishlistItem[]> => {
  const token = await getAuthToken();

  if (!token) {
    return [];
  }

  const wishlist = await getCurrentWishlist(token);

  if (!wishlist) {
    return [];
  }

  return listWishlistItems(wishlist.id, token);
});

export async function addToWishlist(variantId: string): Promise<WishlistItem> {
  const normalizedVariantId = variantId.trim();

  if (!normalizedVariantId) {
    throw new Error("Select a variant before adding it to your wishlist.");
  }

  const token = requireWishlistToken(await getAuthToken());
  const wishlist = await getOrCreateWishlist(token);
  const currentItems = await listWishlistItems(wishlist.id, token);
  const existingItem = currentItems.find((item) => item.product_variant_id === normalizedVariantId);

  if (existingItem) {
    return existingItem;
  }

  const data = await requestWishlist(
    `/store/wishlists/${encodeURIComponent(wishlist.id)}/add-item`,
    {
      body: { product_variant_id: normalizedVariantId },
      method: "POST",
      token,
    },
  );
  const item = parseWishlistItem(data);

  if (!item) {
    throw new Error("Medusa did not return a wishlist item.");
  }

  return item;
}

export async function removeFromWishlist(itemId: string): Promise<void> {
  const normalizedItemId = itemId.trim();

  if (!normalizedItemId) {
    throw new Error("Wishlist item ID is required.");
  }

  const token = requireWishlistToken(await getAuthToken());
  const wishlist = await getCurrentWishlist(token);

  if (!wishlist) {
    return;
  }

  await requestWishlist(
    `/store/wishlists/${encodeURIComponent(wishlist.id)}/items/${encodeURIComponent(normalizedItemId)}`,
    {
      method: "DELETE",
      token,
    },
  );
}
