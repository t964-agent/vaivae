"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type MuxVideoProps = {
  aspectRatio?: string;
  autoPlay?: boolean;
  className?: string;
  controls?: boolean;
  loop?: boolean;
  metadata?: {
    video_title?: string;
  };
  muted?: boolean;
  playbackId: string;
  posterUrl?: string;
};

export function MuxVideo({
  aspectRatio = "16/9",
  autoPlay = true,
  className,
  controls = false,
  loop = true,
  metadata,
  muted = true,
  playbackId,
  posterUrl,
}: MuxVideoProps) {
  const reduceMotion = useReducedMotion() === true;
  const style = { aspectRatio } satisfies CSSProperties;

  if (reduceMotion) {
    return (
      <div className={cn("relative overflow-hidden bg-ink", className)} style={style}>
        {posterUrl ? (
          <Image alt="" aria-hidden className="object-cover" fill sizes="100vw" src={posterUrl} />
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn("overflow-hidden bg-ink", className)}
      data-controls={controls ? "true" : "false"}
      style={style}
    >
      <MuxPlayer
        className="size-full"
        loop={loop}
        muted={muted}
        playbackId={playbackId}
        playsInline
        streamType="on-demand"
        title={metadata?.video_title ?? "vaïvae video"}
        {...(autoPlay ? { autoPlay: "muted" as const } : {})}
        {...(metadata ? { metadata } : {})}
        {...(posterUrl ? { poster: posterUrl } : {})}
      />
    </div>
  );
}
