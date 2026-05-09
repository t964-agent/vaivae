import { loadStripe } from "@stripe/stripe-js/pure";
import type { Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;
let loadedPublishableKey: string | null = null;

export function getStripe(publishableKey: string): Promise<Stripe | null> {
  const normalizedKey = publishableKey.trim();

  if (!normalizedKey) {
    return Promise.resolve(null);
  }

  if (!stripePromise || loadedPublishableKey !== normalizedKey) {
    loadedPublishableKey = normalizedKey;
    stripePromise = loadStripe(normalizedKey);
  }

  return stripePromise;
}
