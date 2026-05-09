"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type VideoWithFrameCallback = HTMLVideoElement & {
  cancelVideoFrameCallback?: (handle: number) => void;
  requestVideoFrameCallback?: (callback: (now: number, metadata: unknown) => void) => number;
};

type FrameSample = {
  bitmapPromise: Promise<ImageBitmap>;
  time: number;
};

type UseFrameCaptureCanvasOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
  onProgress?: ((progress: number) => void) | undefined;
  targetFrames?: number | undefined;
  videoEnd?: number | undefined;
  videoRef: RefObject<HTMLVideoElement | null>;
  videoStart?: number | undefined;
};

const DEFAULT_TARGET_FRAMES = 120;
const MAX_CAPTURE_WIDTH = 1280;

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function waitForMetadata(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const finish = () => resolve();

    video.addEventListener("loadedmetadata", finish, { once: true });
    video.addEventListener("loadeddata", finish, { once: true });
    video.addEventListener("canplay", finish, { once: true });
  });
}

export function useFrameCaptureCanvas({
  canvasRef,
  enabled,
  onProgress,
  targetFrames = DEFAULT_TARGET_FRAMES,
  videoEnd = 0.92,
  videoRef,
  videoStart = 0.02,
}: UseFrameCaptureCanvasOptions) {
  const [ready, setReady] = useState(!enabled);
  const framesRef = useRef<ImageBitmap[]>([]);
  const currentFrameRef = useRef(0);
  const drawFrameRef = useRef<(index: number) => void>(() => undefined);

  const drawFrameForProgress = useCallback(
    (progress: number) => {
      const frames = framesRef.current;

      if (frames.length === 0) {
        return;
      }

      const frameProgress = clamp01((progress - videoStart) / (videoEnd - videoStart));
      const nextFrame = Math.min(frames.length - 1, Math.floor(frameProgress * frames.length));

      if (nextFrame === currentFrameRef.current) {
        return;
      }

      currentFrameRef.current = nextFrame;
      window.requestAnimationFrame(() => drawFrameRef.current(nextFrame));
    },
    [videoEnd, videoStart],
  );

  useEffect(() => {
    const videoNode = videoRef.current as VideoWithFrameCallback | null;
    const canvasNode = canvasRef.current;
    const markReady = () => {
      window.queueMicrotask(() => {
        setReady(true);
        onProgress?.(1);
      });
    };

    if (!enabled) {
      framesRef.current = [];
      markReady();
      return;
    }

    if (!videoNode || !canvasNode) {
      markReady();
      return;
    }

    const video = videoNode;
    const canvas = canvasNode;
    const context = canvas.getContext("2d", { alpha: false });
    const grabCanvas = document.createElement("canvas");
    const grabContext = grabCanvas.getContext("2d", { alpha: false });

    if (!context || !grabContext || typeof window.createImageBitmap !== "function") {
      markReady();
      return;
    }

    const captureContext = grabContext;
    let cancelled = false;
    let resizeFrame = 0;
    let frameCallbackHandle = 0;

    const closeFrames = () => {
      for (const frame of framesRef.current) {
        frame.close();
      }

      framesRef.current = [];
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(window.innerWidth * dpr));
      const height = Math.max(1, Math.round(window.innerHeight * dpr));

      if (canvas.width !== width) {
        canvas.width = width;
      }

      if (canvas.height !== height) {
        canvas.height = height;
      }

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const drawFrame = (index: number) => {
      const frame = framesRef.current[index];

      if (!frame) {
        return;
      }

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const scale = Math.max(canvasWidth / frame.width, canvasHeight / frame.height);
      const drawWidth = frame.width * scale;
      const drawHeight = frame.height * scale;
      const drawX = (canvasWidth - drawWidth) / 2;
      const drawY = (canvasHeight - drawHeight) / 2;

      context.fillStyle = "#0a0606";
      context.fillRect(0, 0, canvasWidth, canvasHeight);
      context.drawImage(frame, drawX, drawY, drawWidth, drawHeight);
    };

    const scheduleResize = () => {
      if (resizeFrame) {
        return;
      }

      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        resizeCanvas();
        drawFrame(currentFrameRef.current);
      });
    };

    drawFrameRef.current = drawFrame;
    resizeCanvas();
    window.addEventListener("resize", scheduleResize);
    onProgress?.(0.05);

    async function captureFrames() {
      await waitForMetadata(video);

      if (cancelled) {
        return;
      }

      const ratio = video.videoWidth / video.videoHeight || 16 / 9;
      const frameWidth = Math.min(MAX_CAPTURE_WIDTH, video.videoWidth || MAX_CAPTURE_WIDTH);
      const frameHeight = Math.round(frameWidth / ratio);
      const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
      const samples: FrameSample[] = [];
      let lastTime = -1;

      grabCanvas.width = frameWidth;
      grabCanvas.height = frameHeight;
      video.muted = true;
      video.playsInline = true;
      video.loop = false;
      video.playbackRate = 1;

      try {
        video.currentTime = 0;
      } catch {
        // Some streaming states reject seeking before the first decoded frame.
      }

      try {
        await video.play();
      } catch {
        // User agents can block even muted playback; gesture/scroll will still unlock later metadata.
      }

      await new Promise<void>((resolve) => {
        let stopped = false;

        const stop = () => {
          if (stopped) {
            return;
          }

          stopped = true;
          resolve();
        };

        const snap = () => {
          if (cancelled || stopped) {
            return;
          }

          const time = video.currentTime;

          if (
            time === lastTime ||
            time <= 0 ||
            video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
          ) {
            return;
          }

          try {
            captureContext.drawImage(video, 0, 0, frameWidth, frameHeight);
            samples.push({ bitmapPromise: window.createImageBitmap(grabCanvas), time });
            lastTime = time;
            onProgress?.(0.05 + 0.85 * Math.min(1, time / duration));
          } catch {
            // Cross-origin/CORS failures should degrade to the poster/gradient path, not crash hydration.
          }
        };

        video.addEventListener("ended", stop, { once: true });

        if (video.requestVideoFrameCallback) {
          const callback = () => {
            snap();

            if (!stopped && !cancelled) {
              frameCallbackHandle = video.requestVideoFrameCallback?.(callback) ?? 0;
            }
          };

          frameCallbackHandle = video.requestVideoFrameCallback(callback);
        } else {
          const tick = () => {
            snap();

            if (stopped || cancelled) {
              return;
            }

            window.requestAnimationFrame(tick);
          };

          window.requestAnimationFrame(tick);
        }

        window.setTimeout(stop, (duration + 1) * 1000);
      });

      try {
        video.pause();
      } catch {
        // no-op
      }

      const resolved = (
        await Promise.all(
          samples.map((sample) =>
            sample.bitmapPromise
              .then((bitmap) => ({ bitmap, time: sample.time }))
              .catch(() => null),
          ),
        )
      )
        .filter((sample): sample is { bitmap: ImageBitmap; time: number } => sample !== null)
        .sort((left, right) => left.time - right.time);

      if (cancelled) {
        for (const sample of resolved) {
          sample.bitmap.close();
        }

        return;
      }

      closeFrames();

      if (resolved.length === 0) {
        setReady(true);
        onProgress?.(1);
        return;
      }

      const frames: ImageBitmap[] = [];

      const first = resolved[0];

      if (!first) {
        setReady(true);
        onProgress?.(1);
        return;
      }

      for (let index = 0; index < targetFrames; index += 1) {
        const targetTime = (index / (targetFrames - 1)) * duration;
        let best = first;
        let bestDistance = Math.abs(best.time - targetTime);

        for (let sampleIndex = 1; sampleIndex < resolved.length; sampleIndex += 1) {
          const sample = resolved[sampleIndex];

          if (!sample) {
            continue;
          }

          const distance = Math.abs(sample.time - targetTime);

          if (distance < bestDistance) {
            best = sample;
            bestDistance = distance;
          }
        }

        frames[index] = best.bitmap;
      }

      framesRef.current = frames;
      currentFrameRef.current = 0;
      drawFrame(0);
      setReady(true);
      onProgress?.(1);
    }

    void captureFrames();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", scheduleResize);

      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }

      if (frameCallbackHandle && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(frameCallbackHandle);
      }

      closeFrames();
    };
  }, [canvasRef, enabled, onProgress, targetFrames, videoRef]);

  return { drawFrameForProgress, ready };
}
