"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import { renderEmphasisText } from "../page-builder/utils";
import type { HomeHeroContent } from "./home-server-fallback";

function renderHeadingWords(heading: string) {
  return heading
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word, index) => (
      <span className="home-hero-word mr-[0.15em] inline-block" key={`${word}-${index}`}>
        {renderEmphasisText(word)}
      </span>
    ));
}

export const HomeHero = forwardRef<HTMLElement, { content: HomeHeroContent }>(function HomeHero(
  { content },
  ref,
) {
  return (
    <section
      ref={ref}
      aria-labelledby="home-hero-heading"
      className="will-change-opacity pointer-events-auto fixed inset-0 z-[5] flex min-h-[100dvh] flex-col items-start justify-center overflow-hidden px-[5vw] text-on-dark"
      data-screen-label="Hero"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_25%,var(--color-accent-gold)_0%,transparent_55%),radial-gradient(ellipse_90%_70%_at_70%_65%,var(--color-accent-orange)_0%,transparent_60%),radial-gradient(ellipse_100%_80%_at_40%_90%,var(--color-accent-red)_0%,transparent_65%),linear-gradient(180deg,#5a1208_0%,var(--color-accent-red)_40%,var(--color-accent-orange)_75%,var(--color-accent-gold)_100%)]" />
      <div className="absolute inset-[-10%] animate-[vaivae-drift_22s_ease-in-out_infinite] bg-[radial-gradient(ellipse_50%_40%_at_60%_30%,rgba(255,210,140,.6),transparent_60%),radial-gradient(ellipse_40%_30%_at_25%_70%,rgba(255,90,40,.55),transparent_60%)] mix-blend-screen" />
      <div className="absolute inset-0 animate-[vaivae-heat_6s_linear_infinite] bg-[repeating-linear-gradient(0deg,transparent_0,rgba(255,200,140,.04)_2px,transparent_4px)] mix-blend-overlay" />
      <p className="home-hero-label relative z-10 mb-7 text-[0.68rem] tracking-[0.32em] text-on-dark/65 uppercase will-change-[transform,opacity] [text-shadow:0_1px_1px_rgba(0,0,0,.35)]">
        {content.eyebrow}
      </p>
      <h1
        className="relative z-10 max-w-[90vw] pb-[0.3em] font-display text-[clamp(5rem,13vw,12.5rem)] leading-[1.05] font-light tracking-[-0.04em] text-on-dark italic will-change-[transform,opacity] [text-shadow:0_2px_1px_rgba(0,0,0,.18),0_10px_50px_rgba(0,0,0,.18)] [&_em]:text-on-dark"
        id="home-hero-heading"
      >
        {renderHeadingWords(content.heading)}
      </h1>
      <p className="home-hero-tagline relative z-10 mt-16 max-w-[36ch] text-[clamp(0.95rem,1.2vw,1.125rem)] leading-7 text-on-dark/85 will-change-[transform,opacity] [text-shadow:0_1px_1px_rgba(0,0,0,.25)]">
        {content.subhead}
      </p>
      {content.scrollIndicator ? (
        <div
          className={cn(
            "home-scroll-indicator will-change-opacity absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-[0.62rem] tracking-[0.32em] text-on-dark/70 uppercase [text-shadow:0_1px_1px_rgba(0,0,0,.25)]",
          )}
        >
          Scroll
          <span className="relative block h-9 w-px overflow-hidden bg-current after:absolute after:top-[-100%] after:left-0 after:h-full after:w-full after:animate-[vaivae-drop_2.4s_ease-in-out_infinite] after:bg-accent-gold after:content-['']" />
        </div>
      ) : null}
    </section>
  );
});
