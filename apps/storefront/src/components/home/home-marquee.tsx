"use client";

import { forwardRef } from "react";

import { Marquee } from "@/components/atoms/marquee";
import { cn } from "@/lib/utils";

import type { HomeMarqueeContent } from "./home-server-fallback";

export const HomeMarquee = forwardRef<HTMLDivElement, { content: HomeMarqueeContent }>(
  function HomeMarquee({ content }, ref) {
    if (!content.enabled || !content.text) {
      return null;
    }

    return (
      <div
        ref={ref}
        className="pointer-events-none fixed inset-x-0 top-[28vh] z-[4] overflow-hidden whitespace-nowrap opacity-0 will-change-[opacity,transform] max-md:top-[22vh]"
        data-enter="0.10"
        data-leave="0.92"
        data-scroll-speed="-55"
      >
        <div className="home-marquee-motion will-change-transform">
          <Marquee
            className={cn(
              "bg-transparent py-0 text-[12vw] leading-[0.95] tracking-[-0.04em] [text-shadow:0_2px_30px_rgba(0,0,0,.30)] max-md:text-[22vw]",
            )}
            direction={content.direction}
            separator={content.separator}
            speed={100000}
            text={content.text}
            theme="dark"
          />
        </div>
      </div>
    );
  },
);
