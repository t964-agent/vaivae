"use client";

import { useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type MarqueeStyle = CSSProperties & {
  "--marquee-duration": string;
  "--marquee-gap": string;
};

export type MarqueeProps = {
  className?: string;
  direction?: "left" | "right";
  separator?: string;
  speed?: number;
  text: string;
  theme?: "dark" | "light";
};

function MarqueeGroup({ separator, text }: { separator: string; text: string }) {
  return (
    <span className="flex shrink-0 items-center gap-[var(--marquee-gap)] whitespace-nowrap">
      {Array.from({ length: 4 }, (_, index) => (
        <span className="flex items-center gap-[var(--marquee-gap)]" key={`${text}-${index}`}>
          <span>{text}</span>
          <span aria-hidden className="text-accent-orange">
            {separator}
          </span>
        </span>
      ))}
    </span>
  );
}

export function Marquee({
  className,
  direction = "left",
  separator = "·",
  speed = 60,
  text,
  theme = "dark",
}: MarqueeProps) {
  const reduceMotion = useReducedMotion() === true;
  const duration = Number.isFinite(speed) && speed > 0 ? speed : 60;
  const style: MarqueeStyle = {
    "--marquee-duration": `${duration}s`,
    "--marquee-gap": "clamp(1.5rem, 4vw, 4rem)",
  };
  const themeClasses = theme === "dark" ? "bg-oxblood text-on-dark" : "bg-cream text-on-light";

  if (reduceMotion) {
    return (
      <div
        className={cn(
          "overflow-hidden py-6 font-display text-[clamp(4rem,13vw,12rem)] leading-none font-light tracking-[-0.055em] italic",
          themeClasses,
          className,
        )}
      >
        <span>{text}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group overflow-hidden py-6 font-display text-[clamp(4rem,13vw,12rem)] leading-none font-light tracking-[-0.055em] italic",
        themeClasses,
        className,
      )}
      style={style}
    >
      {/* `text` is plain Sanity string content; inline HTML such as <em> is intentionally escaped. */}
      <div
        className={cn(
          "flex w-max gap-[var(--marquee-gap)] will-change-transform hover:[animation-play-state:paused]",
          direction === "left"
            ? "[animation:vaivae-marquee-left_var(--marquee-duration)_linear_infinite]"
            : "[animation:vaivae-marquee-right_var(--marquee-duration)_linear_infinite]",
        )}
      >
        <MarqueeGroup separator={separator} text={text} />
        <span aria-hidden>
          <MarqueeGroup separator={separator} text={text} />
        </span>
      </div>
    </div>
  );
}
