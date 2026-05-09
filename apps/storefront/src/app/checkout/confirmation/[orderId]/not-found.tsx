import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui";

export default function OrderConfirmationNotFound() {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] items-center px-5 py-16 sm:px-8 lg:px-10">
      <section
        className="mx-auto grid max-w-xl gap-6 text-center"
        aria-labelledby="order-not-found-heading"
      >
        <p className="font-body text-[0.68rem] tracking-[0.24em] text-on-light/45 uppercase">
          Order
        </p>
        <h1
          className="font-display text-5xl leading-none font-light tracking-[-0.06em] text-on-light italic sm:text-7xl"
          id="order-not-found-heading"
        >
          We could not find that order.
        </h1>
        <p className="text-sm leading-6 text-on-light/62 sm:text-base sm:leading-7">
          Check the confirmation link from your receipt, or return to vaïvae.
        </p>
        <Button asChild className="mx-auto w-fit" size="lg">
          <Link href={"/" as Route}>Back to vaïvae</Link>
        </Button>
      </section>
    </div>
  );
}
