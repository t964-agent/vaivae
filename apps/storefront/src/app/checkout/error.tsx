"use client";

import { Button } from "@/components/ui";

type CheckoutErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CheckoutError({ reset }: CheckoutErrorProps) {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] items-center px-5 py-16 sm:px-8 lg:px-10">
      <section
        className="mx-auto grid max-w-xl gap-6 text-center"
        aria-labelledby="checkout-error-heading"
      >
        <p className="font-body text-[0.68rem] tracking-[0.24em] text-on-light/45 uppercase">
          Checkout
        </p>
        <h1
          className="font-display text-5xl leading-none font-light tracking-[-0.06em] text-on-light italic sm:text-7xl"
          id="checkout-error-heading"
        >
          The checkout paused.
        </h1>
        <p className="text-sm leading-6 text-on-light/62 sm:text-base sm:leading-7">
          Refresh the secure flow and continue from your bag.
        </p>
        <Button className="mx-auto w-fit" onClick={reset} size="lg">
          Try again
        </Button>
      </section>
    </div>
  );
}
