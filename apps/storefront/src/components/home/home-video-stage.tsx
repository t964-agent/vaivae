"use client";

import { forwardRef, type RefObject } from "react";

import { cn } from "@/lib/utils";

import { HOME_HERO_SEQUENCE, HOME_HERO_SEQUENCE_MEDIA_QUERY } from "./home-hero-sequence";

export const HomeVideoStage = forwardRef<
  HTMLDivElement,
  {
    canvasReady: boolean;
    canvasRef: RefObject<HTMLCanvasElement | null>;
  }
>(function HomeVideoStage({ canvasReady, canvasRef }, ref) {
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden bg-ink will-change-[clip-path] [clip-path:circle(0%_at_50%_50%)]"
      data-home-video-stage
    >
      <picture className="absolute inset-0 block size-full">
        <source media={HOME_HERO_SEQUENCE_MEDIA_QUERY} srcSet={HOME_HERO_SEQUENCE.mobile.poster} />
        <img
          alt=""
          aria-hidden
          className="size-full object-cover opacity-80"
          decoding="async"
          draggable={false}
          src={HOME_HERO_SEQUENCE.desktop.poster}
        />
      </picture>
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "absolute inset-0 size-full bg-ink object-cover opacity-0 transition-opacity duration-500",
          canvasReady && "opacity-100",
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,.45)_100%)]" />
    </div>
  );
});
