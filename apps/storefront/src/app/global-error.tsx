"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-oxblood font-body text-on-dark antialiased">
        <main className="flex min-h-dvh items-center justify-center px-6" id="main-content">
          <section className="max-w-lg text-center">
            <p className="mb-6 text-xs font-medium tracking-[0.32em] text-accent-gold/80 uppercase">
              System hold
            </p>
            <h1 className="font-display text-5xl font-light tracking-[-0.04em] italic sm:text-7xl">
              vaïvae is resetting.
            </h1>
            <p className="mt-6 text-sm leading-6 text-on-dark/70">
              A global error interrupted the storefront shell. Try again, or refresh the page.
            </p>
            <button
              className="mt-10 border border-on-dark/30 px-5 py-3 text-xs font-medium tracking-[0.26em] text-on-dark uppercase transition hover:border-accent-gold hover:text-accent-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
              onClick={reset}
              type="button"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
