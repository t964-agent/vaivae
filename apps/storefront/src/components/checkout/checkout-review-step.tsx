"use client";

import { useElements, useStripe } from "@stripe/react-stripe-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CheckoutAddressData, CheckoutContactData } from "@/components/checkout/types";
import { Button, Checkbox, Separator } from "@/components/ui";
import { dispatchCartUpdated } from "@/lib/cart-events";
import { formatPrice } from "@/lib/format";
import { toast } from "@/lib/toast";
import { completeCartAction } from "@/medusa/actions";
import type { StoreCart } from "@/medusa/types";

type CheckoutReviewStepProps = {
  cart: StoreCart;
  contact: CheckoutContactData;
  disabled?: boolean;
  paymentReady: boolean;
  shippingAddress: CheckoutAddressData;
};

function formatAddress(address: CheckoutAddressData): string {
  return [
    `${address.firstName} ${address.lastName}`.trim(),
    address.address1,
    address.address2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    "United States",
  ]
    .filter((part) => part.trim())
    .join(" · ");
}

function getShippingMethod(cart: StoreCart): string {
  const shippingMethod = cart.shipping_methods?.[0];

  if (!shippingMethod) {
    return "Delivery method pending";
  }

  return `${shippingMethod.name} · ${formatPrice(shippingMethod.amount, cart.currency_code)}`;
}

export function CheckoutReviewStep({
  cart,
  contact,
  disabled = false,
  paymentReady,
  shippingAddress,
}: CheckoutReviewStepProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const canSubmit =
    Boolean(stripe && elements && paymentReady) && !disabled && !isSubmitting && termsAccepted;

  async function placeOrder(): Promise<void> {
    if (!stripe || !elements || !canSubmit) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitResult = await elements.submit();

      if (submitResult.error) {
        toast.error(submitResult.error.message || "Review your payment details.");
        return;
      }

      const paymentResult = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: "if_required",
      });

      if (paymentResult.error) {
        toast.error(paymentResult.error.message || "Payment could not be confirmed.");
        return;
      }

      const paymentStatus = paymentResult.paymentIntent?.status;

      if (paymentStatus !== "succeeded" && paymentStatus !== "requires_capture") {
        toast.info("Payment is still processing. Keep this page open and try again shortly.");
        return;
      }

      const completeResult = await completeCartAction();

      if (!completeResult.ok) {
        toast.error(completeResult.error || "Order could not be placed.");
        return;
      }

      dispatchCartUpdated(null);
      router.push(`/checkout/confirmation/${completeResult.data.orderId}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-5 border-t border-on-light/10 pt-8">
      <div className="grid gap-2">
        <h3 className="font-display text-2xl leading-tight font-light tracking-[-0.04em] text-on-light italic">
          Review
        </h3>
        <p className="text-sm leading-6 text-on-light/60">
          Confirm the final edit before Stripe authorizes the payment and Medusa places the order.
        </p>
      </div>

      <dl className="grid gap-4 text-sm leading-6">
        <div className="grid gap-1">
          <dt className="font-body text-[0.68rem] tracking-[0.18em] text-on-light/45 uppercase">
            Contact
          </dt>
          <dd className="text-on-light">{contact.email}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-body text-[0.68rem] tracking-[0.18em] text-on-light/45 uppercase">
            Ship to
          </dt>
          <dd className="text-on-light">{formatAddress(shippingAddress)}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-body text-[0.68rem] tracking-[0.18em] text-on-light/45 uppercase">
            Delivery
          </dt>
          <dd className="text-on-light">{getShippingMethod(cart)}</dd>
        </div>
      </dl>

      <Separator />

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-on-light/60">Total due</span>
        <span className="font-display text-3xl leading-none font-light tracking-[-0.04em] text-on-light italic tabular-nums">
          {formatPrice(cart.total, cart.currency_code)}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          aria-required="true"
          checked={termsAccepted}
          disabled={disabled || isSubmitting}
          id="checkout-terms"
          onCheckedChange={(value) => setTermsAccepted(value === true)}
        />
        <p className="text-sm leading-5 font-normal text-on-light/65">
          <label htmlFor="checkout-terms">I agree to the vaïvae </label>
          <Link
            className="text-on-light underline underline-offset-4 hover:text-oxblood"
            href="/terms"
          >
            Terms of Service
          </Link>
          .
        </p>
      </div>

      <Button
        disabled={!canSubmit}
        loading={isSubmitting}
        onClick={() => void placeOrder()}
        size="lg"
      >
        Place order
      </Button>

      {!paymentReady ? (
        <p className="text-sm leading-5 text-on-light/55" role="status">
          Complete payment details and billing address to place the order.
        </p>
      ) : null}
      {paymentReady && !termsAccepted ? (
        <p className="text-sm leading-5 text-on-light/55" role="status">
          Accept the Terms of Service to place the order.
        </p>
      ) : null}
    </div>
  );
}
