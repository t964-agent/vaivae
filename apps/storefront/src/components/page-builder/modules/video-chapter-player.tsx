"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { useState } from "react";
import { useInView } from "react-intersection-observer";

import { Badge, Button, HStack } from "@/components/ui";
import { cn } from "@/lib/utils";

const LazyMuxVideo = dynamic(
  () => import("@/components/atoms/mux-video").then((module) => module.MuxVideo),
  { loading: () => null, ssr: false },
);

export type VideoChapterHotspot = {
  href: string | null;
  label: string;
};

type VideoChapterPlayerProps = {
  hotspots?: VideoChapterHotspot[];
  playbackId: string | null;
  posterAlt?: string | undefined;
  posterUrl?: string | undefined;
  title: string;
};

export function VideoChapterPlayer({
  hotspots = [],
  playbackId,
  posterAlt = "",
  posterUrl,
  title,
}: VideoChapterPlayerProps) {
  const reduceMotion = useReducedMotion() === true;
  const [requestedPlay, setRequestedPlay] = useState(false);
  const { inView, ref } = useInView({
    fallbackInView: true,
    rootMargin: "600px 0px",
    skip: reduceMotion,
    triggerOnce: true,
  });
  const shouldMount = Boolean(playbackId && (requestedPlay || (!reduceMotion && inView)));

  return (
    <div className="relative" ref={ref}>
      <div className="relative isolate aspect-video overflow-hidden bg-ink">
        {shouldMount && playbackId ? (
          <LazyMuxVideo
            aspectRatio="16/9"
            autoPlay={!reduceMotion}
            className="size-full"
            controls
            loop={false}
            metadata={{ video_title: title }}
            muted={false}
            playbackId={playbackId}
            {...(posterUrl ? { posterUrl } : {})}
          />
        ) : posterUrl ? (
          <Image
            alt={posterAlt}
            className="object-cover"
            fill
            priority={false}
            sizes="(min-width: 1024px) 80vw, 100vw"
            src={posterUrl}
          />
        ) : null}
        {!shouldMount && playbackId ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/25">
            <Button onClick={() => setRequestedPlay(true)} tone="on-dark" variant="primary">
              Play chapter
            </Button>
          </div>
        ) : null}
        {hotspots.length > 0 ? (
          <HStack className="absolute right-4 bottom-4 left-4" gap={2} wrap>
            {hotspots.map((hotspot) =>
              hotspot.href ? (
                <Link
                  className="focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
                  href={hotspot.href as Route}
                  key={`${hotspot.href}-${hotspot.label}`}
                >
                  <Badge className="bg-cream/90 text-on-light backdrop-blur" size="sm">
                    {hotspot.label}
                  </Badge>
                </Link>
              ) : (
                <Badge
                  className={cn("bg-cream/90 text-on-light backdrop-blur")}
                  key={hotspot.label}
                  size="sm"
                >
                  {hotspot.label}
                </Badge>
              ),
            )}
          </HStack>
        ) : null}
      </div>
    </div>
  );
}
