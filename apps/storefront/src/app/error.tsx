"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-oxblood px-6 text-on-dark"
      id="main-content"
    >
      <section className="max-w-lg text-center">
        <p className="mb-6 text-xs font-medium tracking-[0.32em] text-accent-gold/80 uppercase">
          Something drifted
        </p>
        <h1 className="font-display text-5xl font-light tracking-[-0.04em] italic sm:text-7xl">
          The runway paused.
        </h1>
        <p className="mt-6 text-sm leading-6 text-on-dark/70">
          An error interrupted this view. Try again, or return in a moment.
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
  );
}
