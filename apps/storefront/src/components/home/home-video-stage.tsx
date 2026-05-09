"use client";

import Image from "next/image";
import { forwardRef, useEffect, useState, type RefObject } from "react";

import { MuxVideoBackground } from "@/components/atoms/mux-video-background";
import { cn } from "@/lib/utils";

type NavigatorWithConnection = Navigator & {
  connection?: {
    addEventListener?: EventTarget["addEventListener"];
    removeEventListener?: EventTarget["removeEventListener"];
    saveData?: boolean;
  };
};

function readSaveData(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (navigator as NavigatorWithConnection).connection?.saveData === true;
}

function useSaveDataPreference(): boolean {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    const update = () => setSaveData(readSaveData());

    update();
    connection?.addEventListener?.("change", update);

    return () => connection?.removeEventListener?.("change", update);
  }, []);

  return saveData;
}

export const HomeVideoStage = forwardRef<
  HTMLDivElement,
  {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    playbackId?: string | undefined;
    posterUrl?: string | undefined;
    videoRef: RefObject<HTMLVideoElement | null>;
  }
>(function HomeVideoStage({ canvasRef, playbackId, posterUrl, videoRef }, ref) {
  const saveData = useSaveDataPreference();
  const canLoadVideo = Boolean(playbackId) && !saveData;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden bg-ink will-change-[clip-path] [clip-path:circle(0%_at_50%_50%)]"
      data-home-video-stage
    >
      {canLoadVideo && playbackId ? (
        <MuxVideoBackground
          className="absolute inset-0 size-full [&_[data-vaivae-frame-canvas=true]]:hidden [&_video]:opacity-0"
          playbackId={playbackId}
          videoRef={videoRef}
          {...(posterUrl ? { posterUrl } : {})}
        />
      ) : posterUrl ? (
        <Image
          alt=""
          aria-hidden
          className="object-cover opacity-80"
          fill
          sizes="100vw"
          src={posterUrl}
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_25%,rgba(243,176,58,.32)_0%,transparent_55%),radial-gradient(ellipse_90%_70%_at_70%_65%,rgba(232,116,33,.28)_0%,transparent_60%),linear-gradient(180deg,var(--color-ink)_0%,var(--color-oxblood)_65%,var(--color-ink)_100%)]" />
      )}
      <canvas
        ref={canvasRef}
        aria-hidden
        className={cn(
          "absolute inset-0 size-full bg-ink object-cover",
          !canLoadVideo && "opacity-0",
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,.45)_100%)]" />
    </div>
  );
});
