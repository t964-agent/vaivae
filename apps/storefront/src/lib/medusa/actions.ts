"use server";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { cartQueryParams, getOrCreateCart, retrieveCart } from "@/medusa/cart";
import { clearCartId, getCartId, setCartId } from "@/medusa/cart-cookie";
import { getMedusaClient } from "@/medusa/client";
import type { StoreCart, StoreCartAddress, StoreCartShippingOption } from "@/medusa/types";
import { isUsStateCode } from "@/lib/us-states";

const quantitySchema = z.coerce.number().int().positive().max(99);
const STRIPE_PAYMENT_PROVIDER_ID = "pp_stripe_stripe";

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().optional(),
);

const optionalPhoneSchema = optionalTrimmedString.refine(
  (value) => !value || /^[+()\-\d\s.]{7,32}$/.test(value),
  "Enter a valid phone number.",
);

const usStateSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine(isUsStateCode, "Select a US state.");

const usCountrySchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => value === "US", "vaïvae ships to the United States in Phase 1.");

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

const setCartCustomerSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  phone: optionalPhoneSchema,
});

const checkoutAddressSchema = z.object({
  address1: z.string().trim().min(1, "Enter a street address."),
  address2: optionalTrimmedString,
  city: z.string().trim().min(1, "Enter a city."),
  country: usCountrySchema,
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().min(1, "Enter a last name."),
  phone: optionalPhoneSchema,
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}(?:-\d{4})?$/, "Enter a ZIP code in the format 12345 or 12345-6789."),
  state: usStateSchema,
});

const setCartShippingMethodSchema = z.object({
  optionId: z.string().trim().min(1, "Select a shipping method."),
});

type AddLineItemInput = z.input<typeof addLineItemSchema>;
type UpdateLineItemInput = z.input<typeof updateLineItemSchema>;
type RemoveLineItemInput = z.input<typeof removeLineItemSchema>;
type SetCartCustomerInput = z.input<typeof setCartCustomerSchema>;
type CheckoutAddressInput = z.input<typeof checkoutAddressSchema>;
type CheckoutAddress = z.output<typeof checkoutAddressSchema>;
type SetCartShippingMethodInput = z.input<typeof setCartShippingMethodSchema>;

export type CartActionResult = { cart: StoreCart | null; ok: true } | { error: string; ok: false };
export type CheckoutActionResult<TData> = { data: TData; ok: true } | { error: string; ok: false };
export type PaymentSessionData = {
  clientSecret: string;
};
export type CompleteCartData = {
  orderId: string;
};

function getValidationError(error: z.ZodError): { error: string; ok: false } {
  return { error: error.issues[0]?.message ?? "Invalid cart input.", ok: false };
}

function getActionError(
  error: unknown,
  fallback = "Unable to update cart.",
): { error: string; ok: false } {
  if (error instanceof Error && error.message.trim()) {
    return { error: error.message, ok: false };
  }

  return { error: fallback, ok: false };
}

function revalidateCart(): void {
  revalidateTag("cart", { expire: 0 });
}

async function getExistingCartId(): Promise<string | undefined> {
  await headers();

  return getCartId();
}

function getMissingCartError(): { error: string; ok: false } {
  return { error: "No active cart found.", ok: false };
}

function toMedusaAddress(address: CheckoutAddress) {
  return {
    address_1: address.address1,
    address_2: address.address2 ?? null,
    city: address.city,
    country_code: address.country.toLowerCase(),
    first_name: address.firstName,
    last_name: address.lastName,
    phone: address.phone ?? null,
    postal_code: address.postalCode,
    province: address.state.toLowerCase(),
  };
}

function cartAddressToCheckoutInput(
  address: StoreCartAddress | undefined,
): CheckoutAddressInput | null {
  if (!address) {
    return null;
  }

  return {
    address1: address.address_1 ?? "",
    address2: address.address_2 ?? undefined,
    city: address.city ?? "",
    country: (address.country_code ?? "").toUpperCase(),
    firstName: address.first_name ?? "",
    lastName: address.last_name ?? "",
    phone: address.phone ?? undefined,
    postalCode: address.postal_code ?? "",
    state: (address.province ?? "").toUpperCase(),
  };
}

function getStripeClientSecret(
  cart: StoreCart,
  paymentCollection = cart.payment_collection,
): string | null {
  const stripeSession = paymentCollection?.payment_sessions?.find(
    (session) => session.provider_id === STRIPE_PAYMENT_PROVIDER_ID,
  );
  const clientSecret = stripeSession?.data["client_secret"];

  return typeof clientSecret === "string" && clientSecret.trim() ? clientSecret : null;
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

export async function setCartCustomerAction(
  input: SetCartCustomerInput,
): Promise<CheckoutActionResult<StoreCart>> {
  const parsed = setCartCustomerSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const cartId = await getExistingCartId();

    if (!cartId) {
      return getMissingCartError();
    }

    const { cart } = await getMedusaClient().store.cart.update(
      cartId,
      { email: parsed.data.email },
      cartQueryParams,
    );

    await setCartId(cart.id);
    revalidateCart();

    return { data: cart, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to save contact details.");
  }
}

export async function setCartShippingAddressAction(
  input: CheckoutAddressInput,
): Promise<CheckoutActionResult<StoreCart>> {
  const parsed = checkoutAddressSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const cartId = await getExistingCartId();

    if (!cartId) {
      return getMissingCartError();
    }

    const { cart } = await getMedusaClient().store.cart.update(
      cartId,
      { shipping_address: toMedusaAddress(parsed.data) },
      cartQueryParams,
    );

    await setCartId(cart.id);
    revalidateCart();

    return { data: cart, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to save shipping address.");
  }
}

export async function setCartBillingAddressAction(
  input: CheckoutAddressInput | null,
): Promise<CheckoutActionResult<StoreCart>> {
  try {
    const cartId = await getExistingCartId();

    if (!cartId) {
      return getMissingCartError();
    }

    const addressInput =
      input ?? cartAddressToCheckoutInput((await retrieveCart(cartId)).shipping_address);

    if (!addressInput) {
      return { error: "Add a shipping address before billing.", ok: false };
    }

    const parsed = checkoutAddressSchema.safeParse(addressInput);

    if (!parsed.success) {
      return getValidationError(parsed.error);
    }

    const { cart } = await getMedusaClient().store.cart.update(
      cartId,
      { billing_address: toMedusaAddress(parsed.data) },
      cartQueryParams,
    );

    await setCartId(cart.id);
    revalidateCart();

    return { data: cart, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to save billing address.");
  }
}

export async function listShippingOptionsForCart(): Promise<
  CheckoutActionResult<StoreCartShippingOption[]>
> {
  try {
    const cartId = await getExistingCartId();

    if (!cartId) {
      return getMissingCartError();
    }

    const { shipping_options } = await getMedusaClient().store.fulfillment.listCartOptions({
      cart_id: cartId,
    });

    return { data: shipping_options, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to load shipping methods.");
  }
}

export async function setCartShippingMethodAction(
  input: SetCartShippingMethodInput,
): Promise<CheckoutActionResult<StoreCart>> {
  const parsed = setCartShippingMethodSchema.safeParse(input);

  if (!parsed.success) {
    return getValidationError(parsed.error);
  }

  try {
    const cartId = await getExistingCartId();

    if (!cartId) {
      return getMissingCartError();
    }

    const { cart } = await getMedusaClient().store.cart.addShippingMethod(
      cartId,
      { option_id: parsed.data.optionId },
      cartQueryParams,
    );

    await setCartId(cart.id);
    revalidateCart();

    return { data: cart, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to save shipping method.");
  }
}

export async function initializePaymentSessionAction(): Promise<
  CheckoutActionResult<PaymentSessionData>
> {
  try {
    const cartId = await getExistingCartId();

    if (!cartId) {
      return getMissingCartError();
    }

    const cart = await retrieveCart(cartId);
    const { payment_collection } = await getMedusaClient().store.payment.initiatePaymentSession(
      cart,
      { provider_id: STRIPE_PAYMENT_PROVIDER_ID },
      { fields: "*payment_sessions" },
    );
    const clientSecret = getStripeClientSecret(cart, payment_collection);

    if (!clientSecret) {
      return { error: "Unable to prepare secure payment.", ok: false };
    }

    revalidateCart();

    return { data: { clientSecret }, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to prepare secure payment.");
  }
}

export async function completeCartAction(): Promise<CheckoutActionResult<CompleteCartData>> {
  try {
    const cartId = await getExistingCartId();

    if (!cartId) {
      return getMissingCartError();
    }

    const result = await getMedusaClient().store.cart.complete(cartId, {
      fields: "id,display_id",
    });

    if (result.type === "cart") {
      await setCartId(result.cart.id);
      revalidateCart();

      return { error: result.error.message || "Payment could not be completed.", ok: false };
    }

    await clearCartId();
    revalidateCart();

    return { data: { orderId: result.order.id }, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to place order.");
  }
}

export async function clearCartCookieAction(): Promise<CheckoutActionResult<null>> {
  await headers();

  try {
    await clearCartId();
    revalidateCart();

    return { data: null, ok: true };
  } catch (error) {
    return getActionError(error, "Unable to clear the completed cart.");
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
