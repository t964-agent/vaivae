import type { Metadata, Route } from "next";
import Link from "next/link";

import { CheckoutPage } from "@/components/checkout/checkout-page";
import { Button } from "@/components/ui";
import { getCart } from "@/medusa/cart";
import { getMedusaClient } from "@/medusa/client";
import { getDefaultRegion } from "@/medusa/regions";
import type { StoreCart, StoreCartShippingOption } from "@/medusa/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  alternates: { canonical: "/checkout" },
  robots: {
    follow: false,
    index: false,
  },
  title: "Checkout",
};

async function listInitialShippingOptions(cart: StoreCart): Promise<StoreCartShippingOption[]> {
  if (!cart.shipping_address?.address_1 || !cart.shipping_address.postal_code) {
    return [];
  }

  try {
    const { shipping_options } = await getMedusaClient().store.fulfillment.listCartOptions({
      cart_id: cart.id,
    });

    return shipping_options;
  } catch {
    return [];
  }
}

function EmptyCheckoutState() {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] items-center px-5 py-16 sm:px-8 lg:px-10">
      <section
        className="mx-auto grid max-w-xl gap-6 text-center"
        aria-labelledby="empty-checkout-heading"
      >
        <p className="font-body text-[0.68rem] tracking-[0.24em] text-on-light/45 uppercase">
          Checkout
        </p>
        <h1
          className="font-display text-5xl leading-none font-light tracking-[-0.06em] text-on-light italic sm:text-7xl"
          id="empty-checkout-heading"
        >
          Your bag is quiet.
        </h1>
        <p className="text-sm leading-6 text-on-light/62 sm:text-base sm:leading-7">
          Return to the collection and choose the pieces that should travel with you.
        </p>
        <Button asChild className="mx-auto w-fit" size="lg">
          <Link href={"/products" as Route}>Discover the collection</Link>
        </Button>
      </section>
    </div>
  );
}

export default async function CheckoutRoute() {
  const cart = await getCart();

  if (!cart || (cart.items ?? []).length === 0) {
    return <EmptyCheckoutState />;
  }

  const [region, initialShippingOptions] = await Promise.all([
    getDefaultRegion(),
    listInitialShippingOptions(cart),
  ]);

  return (
    <CheckoutPage
      initialCart={cart}
      initialShippingOptions={initialShippingOptions}
      regionId={region.id}
      stripePublishableKey={process.env["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] ?? ""}
    />
  );
}
