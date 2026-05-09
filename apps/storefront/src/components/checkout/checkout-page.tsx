"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { CheckoutAddressStep } from "@/components/checkout/checkout-address-step";
import { CheckoutContactStep } from "@/components/checkout/checkout-contact-step";
import { CheckoutPaymentStep } from "@/components/checkout/checkout-payment-step";
import { CheckoutReviewStep } from "@/components/checkout/checkout-review-step";
import { CheckoutShippingMethodStep } from "@/components/checkout/checkout-shipping-method-step";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import type {
  CheckoutAddressData,
  CheckoutContactData,
  CheckoutShippingOption,
  CheckoutStep,
} from "@/components/checkout/types";
import { Button } from "@/components/ui";
import { track } from "@/lib/analytics/track";
import { dispatchCartUpdated } from "@/lib/cart-events";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  listShippingOptionsForCart,
  setCartCustomerAction,
  setCartShippingAddressAction,
  setCartShippingMethodAction,
} from "@/medusa/actions";
import type { StoreCart, StoreCartAddress } from "@/medusa/types";

type CheckoutPageProps = {
  initialAddress?: CheckoutAddressData | null;
  initialCart: StoreCart;
  initialCustomer?: InitialCheckoutCustomer | null;
  initialShippingOptions: CheckoutShippingOption[];
  regionId: string;
  stripePublishableKey: string;
};

type InitialCheckoutCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type CheckoutStepSectionProps = {
  children: ReactNode;
  complete?: boolean;
  disabled?: boolean;
  eyebrow: string;
  isActive: boolean;
  onEdit?: (() => void) | undefined;
  summary?: string | undefined;
  title: string;
};

const emptyAddress: CheckoutAddressData = {
  address1: "",
  address2: "",
  city: "",
  country: "US",
  firstName: "",
  lastName: "",
  phone: "",
  postalCode: "",
  state: "",
};

function getAddressData(
  address: StoreCartAddress | undefined,
  fallbackPhone = "",
): CheckoutAddressData {
  return {
    address1: address?.address_1 ?? "",
    address2: address?.address_2 ?? "",
    city: address?.city ?? "",
    country: "US",
    firstName: address?.first_name ?? "",
    lastName: address?.last_name ?? "",
    phone: address?.phone ?? fallbackPhone,
    postalCode: address?.postal_code ?? "",
    state: (address?.province ?? "").toUpperCase(),
  };
}

function getContactData(
  cart: StoreCart,
  initialCustomer: InitialCheckoutCustomer | null | undefined,
): CheckoutContactData {
  return {
    email: cart.email ?? initialCustomer?.email ?? "",
    phone: cart.shipping_address?.phone ?? initialCustomer?.phone ?? "",
  };
}

function getInitialShippingAddressData({
  cart,
  contactPhone,
  initialAddress,
  initialCustomer,
}: {
  cart: StoreCart;
  contactPhone: string;
  initialAddress: CheckoutAddressData | null | undefined;
  initialCustomer: InitialCheckoutCustomer | null | undefined;
}): CheckoutAddressData {
  if (cart.shipping_address?.address_1 || cart.shipping_address?.postal_code) {
    return getAddressData(cart.shipping_address, cart.shipping_address.phone ?? contactPhone);
  }

  if (initialAddress?.address1 || initialAddress?.postalCode) {
    return initialAddress;
  }

  return {
    ...emptyAddress,
    firstName: initialCustomer?.firstName ?? "",
    lastName: initialCustomer?.lastName ?? "",
    phone: contactPhone,
  };
}

function getContactSummary(contact: CheckoutContactData): string {
  return contact.phone ? `${contact.email} · ${contact.phone}` : contact.email;
}

function getAddressSummary(address: CheckoutAddressData): string {
  return [
    `${address.firstName} ${address.lastName}`.trim(),
    address.address1,
    address.address2,
    `${address.city}, ${address.state} ${address.postalCode}`,
  ]
    .filter((part) => part.trim())
    .join(" · ");
}

function getShippingMethodId(cart: StoreCart): string | null {
  return cart.shipping_methods?.[0]?.shipping_option_id ?? null;
}

function getShippingMethodSummary(cart: StoreCart): string {
  return cart.shipping_methods?.[0]?.name ?? "Delivery method selected";
}

function getCartValue(cart: StoreCart): number {
  return typeof cart.total === "number" ? cart.total / 100 : 0;
}

function getCurrencyCode(currencyCode: string | null | undefined): string {
  return (currencyCode?.trim() || "usd").toUpperCase();
}

function getInitialCheckoutStep(cart: StoreCart): CheckoutStep {
  if (!cart.email) {
    return "contact";
  }

  if (!cart.shipping_address?.address_1 || !cart.shipping_address.postal_code) {
    return "shipping-address";
  }

  if (!getShippingMethodId(cart)) {
    return "shipping-method";
  }

  return "payment";
}

function CheckoutStepSection({
  children,
  complete = false,
  disabled = false,
  eyebrow,
  isActive,
  onEdit,
  summary,
  title,
}: CheckoutStepSectionProps) {
  const showSummary = complete && !isActive;

  return (
    <section
      className={cn(
        "grid gap-5 border border-on-light/10 bg-cream p-5 shadow-[0_1px_0_rgba(26,15,8,0.04)] sm:p-6",
        disabled ? "opacity-45" : null,
      )}
      data-disabled={disabled ? "true" : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-2">
          <p className="font-body text-[0.68rem] tracking-[0.2em] text-on-light/45 uppercase">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl leading-none font-light tracking-[-0.05em] text-on-light italic">
            {title}
          </h2>
          {showSummary && summary ? (
            <p className="text-sm leading-6 text-on-light/62">{summary}</p>
          ) : null}
        </div>
        {complete && onEdit ? (
          <Button disabled={disabled} onClick={onEdit} size="sm" type="button" variant="underline">
            Edit
          </Button>
        ) : null}
      </div>

      {isActive ? children : null}
    </section>
  );
}

export function CheckoutPage({
  initialAddress = null,
  initialCart,
  initialCustomer = null,
  initialShippingOptions,
  regionId,
  stripePublishableKey,
}: CheckoutPageProps) {
  const [cart, setCart] = useState(initialCart);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(() =>
    getInitialCheckoutStep(initialCart),
  );
  const [contact, setContact] = useState<CheckoutContactData>(() =>
    getContactData(initialCart, initialCustomer),
  );
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddressData>(() => {
    const initialContact = getContactData(initialCart, initialCustomer);

    return getInitialShippingAddressData({
      cart: initialCart,
      contactPhone: initialContact.phone,
      initialAddress,
      initialCustomer,
    });
  });
  const [shippingOptions, setShippingOptions] =
    useState<CheckoutShippingOption[]>(initialShippingOptions);
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string | null>(() =>
    getShippingMethodId(initialCart),
  );
  const [paymentReady, setPaymentReady] = useState(false);
  const hasTrackedBeginCheckoutRef = useRef(false);

  useEffect(() => {
    if (hasTrackedBeginCheckoutRef.current) {
      return;
    }

    hasTrackedBeginCheckoutRef.current = true;
    track({
      name: "begin_checkout",
      props: {
        cartId: initialCart.id,
        currency: getCurrencyCode(initialCart.currency_code),
        value: getCartValue(initialCart),
      },
    });
  }, [initialCart]);

  function commitCart(nextCart: StoreCart): void {
    setCart(nextCart);
    dispatchCartUpdated(nextCart);
  }

  async function handleContactSubmit(values: CheckoutContactData): Promise<void> {
    const result = await setCartCustomerAction(values);

    if (!result.ok) {
      toast.error(result.error || "Could not save contact details.");
      return;
    }

    setContact(values);
    commitCart(result.data);
    setCurrentStep("shipping-address");
  }

  async function handleShippingAddressSubmit(values: CheckoutAddressData): Promise<void> {
    const result = await setCartShippingAddressAction(values);

    if (!result.ok) {
      toast.error(result.error || "Could not save shipping address.");
      return;
    }

    setShippingAddress(values);
    setSelectedShippingOptionId(null);
    setPaymentReady(false);
    commitCart(result.data);

    const optionsResult = await listShippingOptionsForCart();

    if (!optionsResult.ok) {
      toast.error(optionsResult.error || "Could not load delivery methods.");
      setShippingOptions([]);
      setCurrentStep("shipping-method");
      return;
    }

    setShippingOptions(optionsResult.data);
    setCurrentStep("shipping-method");
  }

  async function handleShippingMethodSubmit(optionId: string): Promise<void> {
    const result = await setCartShippingMethodAction({ optionId });

    if (!result.ok) {
      toast.error(result.error || "Could not save delivery method.");
      return;
    }

    setSelectedShippingOptionId(optionId);
    setPaymentReady(false);
    commitCart(result.data);
    setCurrentStep("payment");
  }

  const contactComplete = Boolean(contact.email);
  const shippingAddressComplete = Boolean(shippingAddress.address1 && shippingAddress.postalCode);
  const shippingMethodComplete = Boolean(selectedShippingOptionId);
  const paymentStepActive = currentStep === "payment" || currentStep === "review";

  return (
    <div className="min-h-dvh bg-cream" data-region-id={regionId}>
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12 lg:px-10 lg:py-12">
        <div className="grid gap-8">
          <div className="grid gap-4 pt-4">
            <p className="font-body text-[0.68rem] tracking-[0.24em] text-on-light/45 uppercase">
              Secure checkout
            </p>
            <div className="grid gap-4">
              <h1 className="font-display text-5xl leading-none font-light tracking-[-0.06em] text-on-light italic sm:text-7xl">
                The final edit.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-on-light/62 sm:text-base sm:leading-7">
                Guest checkout for US delivery. Stripe encrypts payment details; Medusa confirms the
                order.
              </p>
            </div>
          </div>

          <details className="group border border-on-light/10 bg-on-light/[0.03] p-4 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm text-on-light">
              <span>Order summary</span>
              <span className="text-on-light/55 group-open:hidden">Show</span>
              <span className="hidden text-on-light/55 group-open:inline">Hide</span>
            </summary>
            <div className="mt-5">
              <CheckoutSummary cart={cart} />
            </div>
          </details>

          <div className="grid gap-4">
            <CheckoutStepSection
              complete={contactComplete}
              eyebrow="Step 1"
              isActive={currentStep === "contact"}
              onEdit={() => setCurrentStep("contact")}
              summary={contactComplete ? getContactSummary(contact) : undefined}
              title="Contact"
            >
              <CheckoutContactStep defaultValues={contact} onSubmit={handleContactSubmit} />
            </CheckoutStepSection>

            <CheckoutStepSection
              complete={shippingAddressComplete}
              disabled={!contactComplete}
              eyebrow="Step 2"
              isActive={currentStep === "shipping-address"}
              onEdit={() => setCurrentStep("shipping-address")}
              summary={shippingAddressComplete ? getAddressSummary(shippingAddress) : undefined}
              title="Shipping address"
            >
              <CheckoutAddressStep
                buttonLabel="Continue to delivery method"
                defaultValues={
                  shippingAddress.address1
                    ? shippingAddress
                    : { ...emptyAddress, phone: contact.phone }
                }
                disabled={!contactComplete}
                legend="Shipping address"
                onSubmit={handleShippingAddressSubmit}
                scope="shipping"
              />
            </CheckoutStepSection>

            <CheckoutStepSection
              complete={shippingMethodComplete}
              disabled={!shippingAddressComplete}
              eyebrow="Step 3"
              isActive={currentStep === "shipping-method"}
              onEdit={() => setCurrentStep("shipping-method")}
              summary={shippingMethodComplete ? getShippingMethodSummary(cart) : undefined}
              title="Delivery method"
            >
              <CheckoutShippingMethodStep
                currencyCode={cart.currency_code}
                disabled={!shippingAddressComplete}
                onSubmit={handleShippingMethodSubmit}
                options={shippingOptions}
                selectedOptionId={selectedShippingOptionId}
              />
            </CheckoutStepSection>

            <CheckoutStepSection
              disabled={!shippingMethodComplete}
              eyebrow="Step 4"
              isActive={paymentStepActive}
              summary={paymentReady ? "Payment details ready for review" : undefined}
              title="Payment"
            >
              <CheckoutPaymentStep
                billingAddressDefault={shippingAddress.address1 ? shippingAddress : emptyAddress}
                disabled={!shippingMethodComplete}
                onCartChange={commitCart}
                onReadyChange={(ready) => {
                  setPaymentReady(ready);

                  if (ready) {
                    setCurrentStep("review");
                    return;
                  }

                  if (currentStep === "review") {
                    setCurrentStep("payment");
                  }
                }}
                stripePublishableKey={stripePublishableKey}
              >
                <div
                  className={cn(
                    "border border-on-light/10 bg-on-light/[0.025] p-5 sm:p-6",
                    !paymentReady ? "opacity-60" : null,
                  )}
                >
                  <p className="mb-4 font-body text-[0.68rem] tracking-[0.2em] text-on-light/45 uppercase">
                    Step 5
                  </p>
                  <CheckoutReviewStep
                    cart={cart}
                    contact={contact}
                    disabled={!paymentReady}
                    paymentReady={paymentReady}
                    shippingAddress={shippingAddress}
                  />
                </div>
              </CheckoutPaymentStep>
            </CheckoutStepSection>
          </div>

          <Button asChild className="w-fit" variant="underline">
            <Link href={"/products" as Route}>Return to collection</Link>
          </Button>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-8 border border-on-light/10 bg-on-light/[0.03] p-6">
            <CheckoutSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  );
}
