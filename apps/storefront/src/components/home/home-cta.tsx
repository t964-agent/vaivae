"use client";

import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui";

import { renderEmphasisText } from "../page-builder/utils";
import type { HomeCtaContent } from "./home-server-fallback";

function CtaButton({ cta }: { cta: HomeCtaContent }) {
  const className =
    "home-section-child pointer-events-auto mt-2 h-auto rounded-full border-0 bg-on-dark px-12 py-5 font-display text-[clamp(1.375rem,2vw,2rem)] leading-none font-light tracking-[-0.01em] text-oxblood italic shadow-soft transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold";

  if (/^(https?:|mailto:|tel:)/i.test(cta.href)) {
    const target = cta.targetBlank ? "_blank" : undefined;
    const rel = target ? "noopener noreferrer" : undefined;

    return (
      <Button asChild className={className} tone="on-dark" variant="primary">
        <a href={cta.href} rel={rel} target={target}>
          {cta.label}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild className={className} tone="on-dark" variant="primary">
      <Link href={cta.href as Route}>{cta.label}</Link>
    </Button>
  );
}

export function HomeCta({ cta }: { cta: HomeCtaContent }) {
  return (
    <section
      className="home-scroll-section section-cta will-change-opacity pointer-events-none absolute inset-x-0 mt-[-50vh] flex h-[100vh] w-full items-center justify-center px-[5vw] text-center opacity-0"
      data-animation="scale-up"
      data-enter="89"
      data-leave="100"
      data-persist="true"
      data-screen-label="06 CTA"
      style={{ top: "94.5%" }}
    >
      <div className="z-[6] flex max-w-full flex-col items-center gap-8 text-center">
        <p className="home-section-child text-[0.68rem] tracking-[0.32em] text-on-dark/65 uppercase [text-shadow:0_1px_1px_rgba(0,0,0,.35)]">
          {cta.eyebrow}
        </p>
        <h2 className="home-section-child font-display text-[clamp(3.5rem,8vw,8.75rem)] leading-[0.95] font-light tracking-[-0.03em] text-on-dark italic [text-shadow:var(--shadow-soft)] [&_em]:text-accent-gold [&_em]:[text-shadow:0_1px_1px_rgba(40,18,6,.55),0_0_28px_rgba(243,176,58,.18)]">
          {renderEmphasisText(cta.heading)}
        </h2>
        {cta.body ? (
          <p className="home-section-child max-w-xl text-on-dark/72 [text-shadow:var(--shadow-fine)]">
            {cta.body}
          </p>
        ) : null}
        <CtaButton cta={cta} />
        <div className="home-section-child mt-4 flex flex-wrap items-center justify-center gap-4 text-[0.68rem] tracking-[0.24em] text-on-dark/55 uppercase [text-shadow:0_1px_1px_rgba(0,0,0,.35)] md:gap-8">
          {cta.meta.map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
