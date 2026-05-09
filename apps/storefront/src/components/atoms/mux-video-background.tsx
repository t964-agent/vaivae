"use client";

import { useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, type MutableRefObject, type Ref } from "react";

import { cn } from "@/lib/utils";

export type MuxVideoBackgroundProps = {
  canvasRef?: Ref<HTMLCanvasElement>;
  className?: string;
  playbackId: string;
  posterUrl?: string;
  videoRef?: Ref<HTMLVideoElement>;
};

function assignRef<TValue>(ref: Ref<TValue> | undefined, value: TValue | null): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(value);
    return;
  }

  (ref as MutableRefObject<TValue | null>).current = value;
}

export function MuxVideoBackground({
  canvasRef,
  className,
  playbackId,
  posterUrl,
  videoRef,
}: MuxVideoBackgroundProps) {
  const reduceMotion = useReducedMotion() === true;
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`;
  const mp4FallbackUrl = `https://stream.mux.com/${playbackId}/lowest.mp4`;

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      internalVideoRef.current = node;
      assignRef(videoRef, node);
    },
    [videoRef],
  );

  const setCanvasRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      internalCanvasRef.current = node;
      assignRef(canvasRef, node);
    },
    [canvasRef],
  );

  useEffect(() => {
    const video = internalVideoRef.current;
    const canvas = internalCanvasRef.current;

    if (!video || !canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      return;
    }

    const syncCanvas = () => {
      if (video.videoWidth <= 0 || video.videoHeight <= 0) {
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    };

    video.addEventListener("loadeddata", syncCanvas);
    video.addEventListener("seeked", syncCanvas);

    return () => {
      video.removeEventListener("loadeddata", syncCanvas);
      video.removeEventListener("seeked", syncCanvas);
    };
  }, []);

  if (reduceMotion) {
    return (
      <div className={cn("relative overflow-hidden bg-ink", className)}>
        {posterUrl ? (
          <Image alt="" aria-hidden className="object-cover" fill sizes="100vw" src={posterUrl} />
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-ink", className)}>
      {/* Native HLS covers Safari; the MP4 source is a static-rendition fallback for frame capture when available. */}
      <video
        ref={setVideoRef}
        aria-hidden
        autoPlay
        className="absolute inset-0 size-full object-cover"
        crossOrigin="anonymous"
        loop
        muted
        playsInline
        poster={posterUrl}
        preload="auto"
      >
        <source src={hlsUrl} type="application/x-mpegURL" />
        <source src={mp4FallbackUrl} type="video/mp4" />
      </video>
      <canvas
        ref={setCanvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-0"
        data-vaivae-frame-canvas="true"
      />
    </div>
  );
}
