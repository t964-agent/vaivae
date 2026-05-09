"use client";

import { useReducedMotion } from "motion/react";
import type { Ref } from "react";

import { Marquee } from "@/components/atoms/marquee";
import { MuxVideoBackground } from "@/components/atoms/mux-video-background";
import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { Container, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";

import { CtaLink } from "../cta-link";
import type { PageBuilderModuleOf } from "../types";
import { getImageUrl, renderEmphasisText } from "../utils";

export type HeroFilmProps = {
  canvasRef?: Ref<HTMLCanvasElement> | undefined;
  data: PageBuilderModuleOf<"heroFilm">;
  videoRef?: Ref<HTMLVideoElement> | undefined;
};

function HeroMedia({
  canvasRef,
  data,
  videoRef,
}: {
  canvasRef?: Ref<HTMLCanvasElement> | undefined;
  data: PageBuilderModuleOf<"heroFilm">;
  videoRef?: Ref<HTMLVideoElement> | undefined;
}) {
  const reduceMotion = useReducedMotion() === true;
  const media = data.media;
  const posterUrl = getImageUrl(media?.posterImage);

  if (media?.sourceType === "mux" && media.muxPlaybackId && !reduceMotion) {
    return (
      <MuxVideoBackground
        className="absolute inset-0 size-full"
        playbackId={media.muxPlaybackId}
        {...(canvasRef ? { canvasRef } : {})}
        {...(videoRef ? { videoRef } : {})}
        {...(posterUrl ? { posterUrl } : {})}
      />
    );
  }

  if (media?.sourceType === "directUrl" && media.directUrl && !reduceMotion) {
    return (
      <video
        aria-hidden
        autoPlay
        className="absolute inset-0 size-full object-cover"
        loop
        muted
        playsInline
        poster={posterUrl}
        preload="auto"
        ref={videoRef}
        src={media.directUrl}
      />
    );
  }

  return (
    <VaivaeImage
      className="absolute inset-0 size-full object-cover"
      image={media?.posterImage}
      priority
      sizes="100vw"
      width={1800}
    />
  );
}

export function HeroFilm({ canvasRef, data, videoRef }: HeroFilmProps) {
  const heading = data.heading?.trim();

  if (!heading) {
    return null;
  }

  return (
    <section className="relative isolate min-h-[92dvh] overflow-hidden bg-ink text-on-dark">
      <HeroMedia canvasRef={canvasRef} data={data} videoRef={videoRef} />
      <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/25 to-ink/15" />
      <Container
        className="relative flex min-h-[92dvh] items-end pt-40 pb-14 md:pb-20"
        variant="wide"
      >
        <Stack className="max-w-5xl" gap={6}>
          {data.eyebrow ? (
            <SectionEyebrow className="text-on-dark/65">{data.eyebrow}</SectionEyebrow>
          ) : null}
          <SectionHeading as="h1" className="text-[clamp(4rem,12vw,13rem)] text-on-dark">
            {renderEmphasisText(heading)}
          </SectionHeading>
          {data.subhead ? (
            <SectionBody className="text-on-dark/72">{data.subhead}</SectionBody>
          ) : null}
          <CtaLink cta={data.cta} tone="on-dark" />
        </Stack>
      </Container>
      {data.scrollIndicator ? (
        <div className="absolute right-6 bottom-8 hidden text-xs tracking-[0.28em] text-on-dark/55 uppercase md:block">
          Scroll
        </div>
      ) : null}
      {data.marquee?.enabled && data.marquee.text ? (
        <Marquee
          className={cn("absolute inset-x-0 bottom-0 border-y border-on-dark/10 bg-ink/45")}
          direction={data.marquee.direction ?? "left"}
          separator={data.marquee.separator ?? "·"}
          speed={data.marquee.speed ?? 60}
          text={data.marquee.text}
          theme="light"
        />
      ) : null}
    </section>
  );
}
