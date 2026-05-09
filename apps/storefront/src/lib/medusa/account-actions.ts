"use server";

import * as Sentry from "@sentry/nextjs";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { isUsStateCode } from "@/lib/us-states";
import { addLineItemAction } from "@/medusa/actions";
import {
  createAddress,
  deleteAddress,
  getCurrentCustomer,
  retrieveOrder,
  updateAddress,
} from "@/medusa/customer";
import type { StoreCart, StoreCustomer, StoreOrder } from "@/medusa/types";
import { addToWishlist, removeFromWishlist, type WishlistItem } from "@/medusa/wishlist";

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const optionalPhoneSchema = optionalTrimmedString.refine(
  (value) => !value || /^[+()\-\d\s.]{7,32}$/.test(value),
  "Enter a valid phone number.",
);

const addressSchema = z.object({
  address1: z.string().trim().min(1, "Enter a street address."),
  address2: optionalTrimmedString,
  city: z.string().trim().min(1, "Enter a city."),
  country: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => value === "US", "vaïvae ships to the United States in Phase 1."),
  firstName: z.string().trim().min(1, "Enter a first name."),
  isDefaultBilling: z.boolean(),
  isDefaultShipping: z.boolean(),
  lastName: z.string().trim().min(1, "Enter a last name."),
  phone: optionalPhoneSchema,
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(?:-\d{4})?$/, "Enter a ZIP code in the format 12345 or 12345-6789."),
  state: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine(isUsStateCode, "Select a US state."),
});

const idSchema = z.string().trim().min(1, "ID is required.");

const marketingPreferencesSchema = z.object({
  subscribed: z.boolean(),
});

type AddressInput = z.input<typeof addressSchema>;
type AddressData = z.output<typeof addressSchema>;

export type AccountActionResult<TData> = { data: TData; ok: true } | { error: string; ok: false };
export type SimpleAccountActionResult = { ok: true } | { error: string; ok: false };

function getValidationError(error: z.ZodError): { error: string; ok: false } {
  return { error: error.issues[0]?.message ?? "Check the form and try again.", ok: false };
}

function getActionError(error: unknown, fallback: string): { error: string; ok: false } {
  if (error instanceof Error && error.message.trim()) {
    return { error: error.message, ok: false };
  }

  return { error: fallback, ok: false };
}

function revalidateAccountTags(tags: readonly string[]): void {
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
}

function toMedusaAddress(data: AddressData) {
  return {
    address_1: data.address1,
    address_2: data.address2 ?? null,
    city: data.city,
    country_code: data.country.toLowerCase(),
    first_name: data.firstName,
    is_default_billing: data.isDefaultBilling,
    is_default_shipping: data.isDefaultShipping,
    last_name: data.lastName,
    phone: data.phone ?? null,
    postal_code: data.postalCode,
    province: data.state.toLowerCase(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function getPositiveInteger(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.round(value));
  }

  return 1;
}

function getOrderLineItems(order: StoreOrder): Array<{ quantity: number; variantId: string }> {
  const record = isRecord(order) ? order : null;
  const items = record && Array.isArray(record["items"]) ? record["items"] : [];

  return items.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const variantId =
      getString(item["variant_id"]) ??
      getString(isRecord(item["variant"]) ? item["variant"]["id"] : null);

    if (!variantId) {
      return [];
    }

    return [{ quantity: getPositiveInteger(item["quantity"]), variantId }];
  });
}

export async function addAddressAction(
  input: AddressInput,
): Promise<AccountActionResult<StoreCustomer>> {
  const parsed = addressSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const customer = await createAddress(toMedusaAddress(parsed.data));

    revalidateAccountTags(["customer", "addresses"]);

    return { data: customer, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to add that address.");
  }
}

export async function updateAddressAction(
  id: string,
  input: AddressInput,
): Promise<AccountActionResult<StoreCustomer>> {
  const parsedId = idSchema.safeParse(id);
  const parsed = addressSchema.safeParse(input);

  if (!parsedId.success) {
    return getValidationError(parsedId.error);
  }

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const customer = await updateAddress(parsedId.data, toMedusaAddress(parsed.data));

    revalidateAccountTags(["customer", "addresses"]);

    return { data: customer, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to update that address.");
  }
}

export async function deleteAddressAction(id: string): Promise<AccountActionResult<StoreCustomer>> {
  const parsed = idSchema.safeParse(id);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const customer = await deleteAddress(parsed.data);

    revalidateAccountTags(["customer", "addresses"]);

    return { data: customer, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to remove that address.");
  }
}

export async function addToWishlistAction(
  variantId: string,
): Promise<AccountActionResult<WishlistItem>> {
  const parsed = idSchema.safeParse(variantId);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const item = await addToWishlist(parsed.data);

    revalidateAccountTags(["wishlist"]);

    return { data: item, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to update your wishlist.");
  }
}

export async function removeFromWishlistAction(itemId: string): Promise<SimpleAccountActionResult> {
  const parsed = idSchema.safeParse(itemId);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    await removeFromWishlist(parsed.data);

    revalidateAccountTags(["wishlist"]);

    return { ok: true };
  } catch (error) {
    return getActionError(error, "Unable to update your wishlist.");
  }
}

export async function updateMarketingPreferencesAction(
  input: unknown,
): Promise<SimpleAccountActionResult> {
  const parsed = marketingPreferencesSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  const customer = await getCurrentCustomer();

  if (!customer) {
    return { error: "Sign in to save your preferences.", ok: false };
  }

  Sentry.addBreadcrumb({
    category: "marketing-consent",
    data: {
      source: "account-marketing-preferences",
      subscribed: parsed.data.subscribed,
    },
    level: "info",
    message: "Marketing preference intent captured for Agent 20 backend wiring.",
  });

  revalidateAccountTags(["customer"]);

  return { ok: true };
}

export async function reorderAction(
  orderId: string,
): Promise<AccountActionResult<StoreCart | null>> {
  const parsed = idSchema.safeParse(orderId);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const order = await retrieveOrder(parsed.data);

    if (!order) {
      return { error: "Order not found.", ok: false };
    }

    const items = getOrderLineItems(order);

    if (items.length === 0) {
      return { error: "No reorderable pieces were found.", ok: false };
    }

    let cart: StoreCart | null = null;

    for (const item of items) {
      const result = await addLineItemAction({
        quantity: item.quantity,
        variantId: item.variantId,
      });

      if (!result.ok) {
        return { error: result.error, ok: false };
      }

      cart = result.cart;
    }

    revalidateAccountTags(["cart", "orders"]);

    return { data: cart, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to reorder those pieces.");
  }
}
