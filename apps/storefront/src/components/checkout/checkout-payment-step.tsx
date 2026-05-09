"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";
import type { Stripe, StripeElementsOptions, StripePaymentElementOptions } from "@stripe/stripe-js";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { CheckoutAddressData } from "@/components/checkout/types";
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Spinner,
} from "@/components/ui";
import { getStripe } from "@/lib/stripe";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { isUsStateCode, US_STATES } from "@/lib/us-states";
import { initializePaymentSessionAction, setCartBillingAddressAction } from "@/medusa/actions";
import type { StoreCart } from "@/medusa/types";

const vaivaeAppearance = {
  theme: "stripe",
  variables: {
    borderRadius: "4px",
    colorBackground: "#efe9df",
    colorPrimary: "#c8321c",
    colorText: "#1a0f08",
    fontFamily: "var(--font-inter-tight), sans-serif",
  },
} satisfies NonNullable<StripeElementsOptions["appearance"]>;

const paymentElementOptions: StripePaymentElementOptions = {
  layout: "tabs",
  wallets: {
    applePay: "auto",
    googlePay: "auto",
    link: "auto",
  },
};

const billingAddressSchema = z.object({
  address1: z.string().trim().min(1, "Enter a street address."),
  address2: z.string().trim(),
  city: z.string().trim().min(1, "Enter a city."),
  country: z.literal("US"),
  firstName: z.string().trim().min(1, "Enter a first name."),
  lastName: z.string().trim().min(1, "Enter a last name."),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[+()\-\d\s.]{7,32}$/.test(value), {
      message: "Enter a valid phone number.",
    }),
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

type BillingAddressFormValues = z.infer<typeof billingAddressSchema>;

type CheckoutPaymentStepProps = {
  billingAddressDefault: CheckoutAddressData;
  children: ReactNode;
  disabled?: boolean;
  onCartChange: (cart: StoreCart) => void;
  onReadyChange: (ready: boolean) => void;
  stripePublishableKey: string;
};

type CheckoutPaymentFormProps = {
  billingAddressDefault: CheckoutAddressData;
  children: ReactNode;
  onCartChange: (cart: StoreCart) => void;
  onReadyChange: (ready: boolean) => void;
};

const selectClasses =
  "h-11 w-full rounded-none border border-on-light/20 bg-cream px-4 py-2 font-body text-sm text-on-light shadow-none transition-colors hover:border-on-light/35 focus:border-on-light/40 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold disabled:cursor-not-allowed disabled:opacity-45 data-[invalid=true]:border-accent-red";

export function CheckoutPaymentStep({
  billingAddressDefault,
  children,
  disabled = false,
  onCartChange,
  onReadyChange,
  stripePublishableKey,
}: CheckoutPaymentStepProps) {
  const stripeConfigured = stripePublishableKey.trim().length > 0;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise] = useState<Promise<Stripe | null> | null>(() =>
    stripeConfigured ? getStripe(stripePublishableKey) : null,
  );
  const [error, setError] = useState<string | null>(null);
  const paymentSessionRequested = useRef(false);

  useEffect(() => {
    if (disabled || clientSecret || error || !stripeConfigured || paymentSessionRequested.current) {
      return;
    }

    paymentSessionRequested.current = true;

    // Stripe.js loads https://js.stripe.com/v3 here. Agent 24 must allow Stripe script, frame, and API domains in CSP.
    void initializePaymentSessionAction()
      .then((result) => {
        if (result.ok) {
          setClientSecret(result.data.clientSecret);
          return;
        }

        setError(result.error);
      })
      .catch(() => {
        setError("Unable to prepare secure payment.");
      });
  }, [clientSecret, disabled, error, stripeConfigured]);

  useEffect(() => {
    if (disabled) {
      onReadyChange(false);
    }
  }, [disabled, onReadyChange]);

  if (disabled) {
    return <p className="text-sm leading-6 text-on-light/55">Complete delivery before payment.</p>;
  }

  if (!stripeConfigured || error) {
    return (
      <div className="grid gap-4 rounded-[2px] border border-accent-red/30 bg-accent-red/5 p-5">
        <p className="text-sm leading-6 text-on-light">
          {error ?? "Stripe is not configured for this environment yet."}
        </p>
        <Button
          className="w-fit"
          onClick={() => {
            paymentSessionRequested.current = false;
            setClientSecret(null);
            setError(null);
          }}
          variant="ghost"
        >
          Try again
        </Button>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <div className="flex items-center gap-3 text-sm text-on-light/60" role="status">
        <Spinner label="Preparing secure payment" size="sm" />
        Preparing secure payment.
      </div>
    );
  }

  return (
    <Elements
      key={clientSecret}
      options={{ appearance: vaivaeAppearance, clientSecret }}
      stripe={stripePromise}
    >
      <CheckoutPaymentForm
        billingAddressDefault={billingAddressDefault}
        onCartChange={onCartChange}
        onReadyChange={onReadyChange}
      >
        {children}
      </CheckoutPaymentForm>
    </Elements>
  );
}

function CheckoutPaymentForm({
  billingAddressDefault,
  children,
  onCartChange,
  onReadyChange,
}: CheckoutPaymentFormProps) {
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isBillingSaved, setIsBillingSaved] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isSavingBilling, setIsSavingBilling] = useState(false);
  const form = useForm<BillingAddressFormValues>({
    defaultValues: billingAddressDefault,
    mode: "onBlur",
    resolver: zodResolver(billingAddressSchema),
  });
  const isReady = isBillingSaved && isPaymentComplete;

  useEffect(() => {
    onReadyChange(isReady);
  }, [isReady, onReadyChange]);

  async function saveBillingAddress(values: BillingAddressFormValues | null): Promise<void> {
    if (isSavingBilling) {
      return;
    }

    setIsSavingBilling(true);

    try {
      const result = await setCartBillingAddressAction(
        values
          ? {
              ...values,
              address2: values.address2.trim(),
              country: "US",
              phone: values.phone.trim(),
              state: values.state.toUpperCase(),
            }
          : null,
      );

      if (result.ok) {
        onCartChange(result.data);
        setIsBillingSaved(true);
        return;
      }

      toast.error(result.error || "Could not save billing address.");
    } finally {
      setIsSavingBilling(false);
    }
  }

  const handleBillingSubmit = form.handleSubmit((values) => saveBillingAddress(values));

  return (
    <div className="grid gap-8">
      <div className="grid gap-5">
        <PaymentElement
          onChange={(event) => {
            setIsPaymentComplete(event.complete);
          }}
          options={paymentElementOptions}
        />
        <p className="text-xs leading-5 text-on-light/52">
          Card numbers, expiry, and CVV stay inside Stripe&apos;s encrypted iframe; vaïvae never
          sees or stores card data.
        </p>
      </div>

      <div className="grid gap-4 border-t border-on-light/10 pt-6">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={sameAsShipping}
            id="billing-same-as-shipping"
            onCheckedChange={(checked) => {
              const nextValue = checked === true;

              setSameAsShipping(nextValue);
              setIsBillingSaved(false);
              onReadyChange(false);
            }}
          />
          <div className="grid gap-1">
            <Label htmlFor="billing-same-as-shipping">Billing address matches shipping</Label>
            <p className="text-sm leading-5 text-on-light/55">
              Use the delivery address for payment.
            </p>
          </div>
        </div>

        {sameAsShipping ? (
          <Button
            className="w-fit"
            loading={isSavingBilling}
            onClick={() => void saveBillingAddress(null)}
            size="lg"
            type="button"
          >
            Continue to review
          </Button>
        ) : (
          <Form {...form}>
            <form className="grid gap-5" noValidate onSubmit={handleBillingSubmit}>
              <fieldset className="grid gap-5" disabled={isSavingBilling}>
                <legend className="sr-only">Billing address</legend>
                <input type="hidden" value="US" {...form.register("country")} />

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input autoComplete="billing given-name" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input autoComplete="billing family-name" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street address</FormLabel>
                      <FormControl>
                        <Input autoComplete="billing address-line1" required {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                      <FormControl>
                        <Input autoComplete="billing address-line2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-5 sm:grid-cols-[1fr_8rem_10rem]">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input autoComplete="billing address-level2" required {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <select
                            autoComplete="billing address-level1"
                            className={cn(
                              selectClasses,
                              fieldState.error ? "border-accent-red" : null,
                            )}
                            data-invalid={fieldState.error ? "true" : undefined}
                            required
                            {...field}
                          >
                            <option value="">Select</option>
                            {US_STATES.map((state) => (
                              <option key={state.code} value={state.code}>
                                {state.code}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP code</FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="billing postal-code"
                            inputMode="numeric"
                            required
                            type="text"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Country</Label>
                  <div className="flex h-11 items-center border border-on-light/15 bg-on-light/[0.03] px-4 text-sm text-on-light/70">
                    United States
                  </div>
                </div>
              </fieldset>

              <Button className="w-fit" loading={isSavingBilling} size="lg" type="submit">
                Continue to review
              </Button>
            </form>
          </Form>
        )}
      </div>

      {children}
    </div>
  );
}
