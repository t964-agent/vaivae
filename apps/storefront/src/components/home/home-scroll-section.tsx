"use client";

import type { CSSProperties } from "react";

import { RichText } from "@/components/atoms/rich-text";
import { cn } from "@/lib/utils";

import { renderEmphasisText } from "../page-builder/utils";
import type { HomeScrollChapterContent } from "./home-server-fallback";

function sectionPositionStyle(chapter: HomeScrollChapterContent): CSSProperties {
  return { top: `${((chapter.enter + chapter.leave) / 2) * 100}%` };
}

export function HomeScrollSection({ chapter }: { chapter: HomeScrollChapterContent }) {
  return (
    <section
      className={cn(
        "home-scroll-section will-change-opacity pointer-events-none absolute inset-x-0 mt-[-50vh] h-[100vh] w-full opacity-0",
        chapter.side === "left" ? "home-align-left" : "home-align-right",
      )}
      data-animation={chapter.animation}
      data-enter={Math.round(chapter.enter * 100)}
      data-leave={Math.round(chapter.leave * 100)}
      data-screen-label={chapter.eyebrow}
      style={sectionPositionStyle(chapter)}
    >
      <div
        className={cn(
          "fixed bottom-[6vh] z-[6] flex max-w-[38vw] flex-col gap-3.5 max-md:right-[6vw] max-md:left-[6vw] max-md:max-w-[88vw] max-md:items-start max-md:text-left",
          chapter.side === "left"
            ? "left-[5vw] items-start text-left"
            : "right-[5vw] items-end text-right",
        )}
      >
        <p className="home-section-child text-[0.68rem] tracking-[0.32em] text-on-dark/75 uppercase will-change-[transform,opacity] [text-shadow:0_1px_1px_rgba(0,0,0,.35)]">
          {chapter.eyebrow}
        </p>
        <h2 className="home-section-child max-w-[13ch] font-display text-[clamp(1.875rem,3.6vw,3.5rem)] leading-[1.05] font-light tracking-[-0.025em] text-on-dark will-change-[transform,opacity] [text-shadow:var(--shadow-soft)] max-md:text-[clamp(1.75rem,7vw,3rem)] [&_em]:text-accent-gold [&_em]:italic [&_em]:[text-shadow:0_1px_1px_rgba(40,18,6,.55),0_0_22px_rgba(243,176,58,.15)]">
          {renderEmphasisText(chapter.heading)}
        </h2>
        {chapter.bodyBlocks?.length ? (
          <RichText
            className="home-section-child max-w-[42ch] text-on-dark/88 will-change-[transform,opacity] [text-shadow:var(--shadow-fine)] prose-p:!text-[clamp(0.95rem,1.05vw,1.125rem)] prose-p:!leading-7 prose-p:!text-on-dark/88"
            value={chapter.bodyBlocks}
          />
        ) : (
          <p className="home-section-child max-w-[42ch] text-[clamp(0.95rem,1.05vw,1.125rem)] leading-7 text-on-dark/88 will-change-[transform,opacity] [text-shadow:var(--shadow-fine)]">
            {chapter.bodyText}
          </p>
        )}
        <p className="home-section-child text-[0.68rem] tracking-[0.24em] text-on-dark/55 uppercase will-change-[transform,opacity] [text-shadow:0_1px_1px_rgba(0,0,0,.35)]">
          {chapter.note}
        </p>
      </div>
    </section>
  );
}
