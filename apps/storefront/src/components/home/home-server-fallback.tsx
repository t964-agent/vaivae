import type { PortableTextBlock } from "@portabletext/types";
import type { Route } from "next";
import Link from "next/link";

import { RichText } from "@/components/atoms/rich-text";
import { cn } from "@/lib/utils";

import { renderEmphasisText } from "../page-builder/utils";

export type HomeHeroContent = {
  eyebrow: string;
  heading: string;
  playbackId?: string | undefined;
  posterUrl?: string | undefined;
  scrollIndicator: boolean;
  subhead: string;
};

export type HomeMarqueeContent = {
  direction: "left" | "right";
  enabled: boolean;
  separator: string;
  speed: number;
  text: string;
};

export type HomeScrollAnimation =
  | "clip-reveal"
  | "fade-up"
  | "rotate-in"
  | "scale-up"
  | "slide-left"
  | "slide-right";

export type HomeScrollChapterContent = {
  animation: HomeScrollAnimation;
  bodyBlocks?: PortableTextBlock[] | undefined;
  bodyText: string;
  enter: number;
  eyebrow: string;
  heading: string;
  key: string;
  leave: number;
  note: string;
  side: "left" | "right";
};

export type HomeCtaContent = {
  body?: string | undefined;
  eyebrow: string;
  heading: string;
  href: string;
  label: string;
  meta: string[];
  targetBlank: boolean;
};

export type HomeContent = {
  chapters: HomeScrollChapterContent[];
  cta: HomeCtaContent;
  hero: HomeHeroContent;
  marquee: HomeMarqueeContent;
};

function FallbackBody({ chapter }: { chapter: HomeScrollChapterContent }) {
  if (chapter.bodyBlocks?.length) {
    return (
      <RichText
        className="max-w-[42ch] text-on-dark/78 prose-p:!text-on-dark/78"
        value={chapter.bodyBlocks}
      />
    );
  }

  return (
    <p className="max-w-[42ch] text-base leading-7 text-on-dark/78 md:text-lg">
      {chapter.bodyText}
    </p>
  );
}

function FallbackCtaLink({ cta }: { cta: HomeCtaContent }) {
  const className =
    "inline-flex rounded-full bg-on-dark px-10 py-5 font-display text-[clamp(1.35rem,2vw,2rem)] leading-none font-light tracking-[-0.01em] text-oxblood italic shadow-soft transition-colors hover:bg-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold";

  if (/^(https?:|mailto:|tel:)/i.test(cta.href)) {
    const target = cta.targetBlank ? "_blank" : undefined;
    const rel = target ? "noopener noreferrer" : undefined;

    return (
      <a className={className} href={cta.href} rel={rel} target={target}>
        {cta.label}
      </a>
    );
  }

  return (
    <Link className={className} href={cta.href as Route}>
      {cta.label}
    </Link>
  );
}

export function HomeServerFallback({
  className,
  content,
}: {
  className?: string;
  content: HomeContent;
}) {
  return (
    <section className={cn("bg-oxblood text-on-dark", className)} data-home-server-fallback>
      <section className="relative isolate flex min-h-[100svh] flex-col items-start justify-center overflow-hidden px-[5vw] py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_25%,var(--color-accent-gold)_0%,transparent_55%),radial-gradient(ellipse_90%_70%_at_70%_65%,var(--color-accent-orange)_0%,transparent_60%),radial-gradient(ellipse_100%_80%_at_40%_90%,var(--color-accent-red)_0%,transparent_65%),linear-gradient(180deg,#5a1208_0%,var(--color-accent-red)_40%,var(--color-accent-orange)_75%,var(--color-accent-gold)_100%)]" />
        <div className="absolute inset-[-10%] animate-[vaivae-drift_22s_ease-in-out_infinite] bg-[radial-gradient(ellipse_50%_40%_at_60%_30%,rgba(255,210,140,.6),transparent_60%),radial-gradient(ellipse_40%_30%_at_25%_70%,rgba(255,90,40,.55),transparent_60%)] mix-blend-screen" />
        <div className="absolute inset-0 animate-[vaivae-heat_6s_linear_infinite] bg-[repeating-linear-gradient(0deg,transparent_0,rgba(255,200,140,.04)_2px,transparent_4px)] mix-blend-overlay" />
        <div className="relative z-10">
          <p className="mb-7 text-[0.68rem] tracking-[0.32em] text-on-dark/65 uppercase [text-shadow:0_1px_1px_rgba(0,0,0,.35)]">
            {content.hero.eyebrow}
          </p>
          <h1 className="max-w-[90vw] pb-[0.3em] font-display text-[clamp(5rem,13vw,12.5rem)] leading-[1.05] font-light tracking-[-0.04em] text-on-dark italic [text-shadow:0_2px_1px_rgba(0,0,0,.18),0_10px_50px_rgba(0,0,0,.18)] [&_em]:text-on-dark">
            {renderEmphasisText(content.hero.heading)}
          </h1>
          <p className="mt-16 max-w-[36ch] text-[clamp(0.95rem,1.2vw,1.125rem)] leading-7 text-on-dark/85 [text-shadow:0_1px_1px_rgba(0,0,0,.25)]">
            {content.hero.subhead}
          </p>
        </div>
        {content.hero.scrollIndicator ? (
          <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-[0.62rem] tracking-[0.32em] text-on-dark/70 uppercase">
            Scroll
            <span className="relative block h-9 w-px overflow-hidden bg-current after:absolute after:top-[-100%] after:left-0 after:h-full after:w-full after:animate-[vaivae-drop_2.4s_ease-in-out_infinite] after:bg-accent-gold after:content-['']" />
          </div>
        ) : null}
      </section>

      <section className="relative overflow-hidden bg-ink px-[5vw] py-20 text-on-dark md:py-28">
        {content.marquee.enabled ? (
          <div className="pointer-events-none -mx-[5vw] mb-12 overflow-hidden font-display text-[clamp(4rem,12vw,11rem)] leading-none font-light tracking-[-0.04em] whitespace-nowrap text-on-dark italic opacity-75 [text-shadow:0_2px_30px_rgba(0,0,0,.30)] md:mb-20">
            {content.marquee.text}
          </div>
        ) : null}
        <div className="grid gap-20 md:gap-28">
          {content.chapters.map((chapter) => (
            <article
              className={cn(
                "grid gap-4",
                chapter.side === "right"
                  ? "justify-items-start md:justify-items-end md:text-right"
                  : "justify-items-start text-left",
              )}
              key={chapter.key}
            >
              <p className="text-[0.68rem] tracking-[0.32em] text-on-dark/70 uppercase [text-shadow:0_1px_1px_rgba(0,0,0,.35)]">
                {chapter.eyebrow}
              </p>
              <h2 className="max-w-[12ch] font-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] font-light tracking-[-0.025em] text-on-dark [text-shadow:var(--shadow-soft)] [&_em]:text-accent-gold [&_em]:italic">
                {renderEmphasisText(chapter.heading)}
              </h2>
              <FallbackBody chapter={chapter} />
              <p className="text-[0.68rem] tracking-[0.24em] text-on-dark/55 uppercase [text-shadow:0_1px_1px_rgba(0,0,0,.35)]">
                {chapter.note}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid min-h-[100svh] place-items-center bg-ink px-[5vw] py-24 text-center text-on-dark">
        <div className="flex max-w-5xl flex-col items-center gap-8">
          <p className="text-[0.68rem] tracking-[0.32em] text-on-dark/65 uppercase [text-shadow:0_1px_1px_rgba(0,0,0,.35)]">
            {content.cta.eyebrow}
          </p>
          <h2 className="font-display text-[clamp(3.5rem,8vw,8.75rem)] leading-[0.95] font-light tracking-[-0.03em] text-on-dark italic [text-shadow:var(--shadow-soft)] [&_em]:text-accent-gold">
            {renderEmphasisText(content.cta.heading)}
          </h2>
          {content.cta.body ? <p className="max-w-xl text-on-dark/72">{content.cta.body}</p> : null}
          <FallbackCtaLink cta={content.cta} />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[0.68rem] tracking-[0.24em] text-on-dark/55 uppercase md:gap-8">
            {content.cta.meta.map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
