"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import {
  getHomeHeroFrameUrl,
  HOME_HERO_SEQUENCE,
  HOME_HERO_SEQUENCE_MEDIA_QUERY,
  type HomeHeroSequence,
} from "../home-hero-sequence";

type UseImageSequenceCanvasOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
  onProgress?: ((progress: number) => void) | undefined;
  videoEnd?: number | undefined;
  videoStart?: number | undefined;
};

const BACKGROUND_WORKERS = 4;
const EAGER_FRAME_INTERVAL = 8;
const EAGER_START_FRAME_COUNT = 24;
const EAGER_WORKERS = 4;

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function selectSequence(): HomeHeroSequence {
  if (window.matchMedia(HOME_HERO_SEQUENCE_MEDIA_QUERY).matches) {
    return HOME_HERO_SEQUENCE.mobile;
  }

  return HOME_HERO_SEQUENCE.desktop;
}

function createFrameLoadPlan(frameCount: number): { background: number[]; eager: number[] } {
  const eager: number[] = [];
  const background: number[] = [];
  const seen = new Set<number>();
  const addEager = (index: number) => {
    if (index < 0 || index >= frameCount || seen.has(index)) {
      return;
    }

    seen.add(index);
    eager.push(index);
  };
  const addBackground = (index: number) => {
    if (index < 0 || index >= frameCount || seen.has(index)) {
      return;
    }

    seen.add(index);
    background.push(index);
  };
  const eagerStartFrames = Math.min(EAGER_START_FRAME_COUNT, frameCount);

  for (let index = 0; index < eagerStartFrames; index += 1) {
    addEager(index);
  }

  addEager(frameCount - 1);

  for (let index = 0; index < frameCount; index += EAGER_FRAME_INTERVAL) {
    addEager(index);
  }

  for (let index = 0; index < frameCount; index += 1) {
    addBackground(index);
  }

  return { background, eager };
}

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Unable to load ${image.src}`));
  });
}

async function loadFrameImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();

  image.decoding = "async";
  image.src = src;

  await waitForImage(image);

  try {
    await image.decode();
  } catch {
    // Safari may reject decode() for images that already fired load; drawImage can still use them.
  }

  return image;
}

function findNearestLoadedFrameIndex(
  frames: Array<HTMLImageElement | undefined>,
  preferredIndex: number,
): number | null {
  if (frames[preferredIndex]) {
    return preferredIndex;
  }

  for (let offset = 1; offset < frames.length; offset += 1) {
    const lower = preferredIndex - offset;
    const upper = preferredIndex + offset;

    if (lower >= 0 && frames[lower]) {
      return lower;
    }

    if (upper < frames.length && frames[upper]) {
      return upper;
    }
  }

  return null;
}

export function useImageSequenceCanvas({
  canvasRef,
  enabled,
  onProgress,
  videoEnd = 0.945,
  videoStart = 0.02,
}: UseImageSequenceCanvasOptions) {
  const [ready, setReady] = useState(!enabled);
  const sequenceRef = useRef<HomeHeroSequence | null>(null);
  const framesRef = useRef<Array<HTMLImageElement | undefined>>([]);
  const currentDrawnFrameRef = useRef(0);
  const currentTargetFrameRef = useRef(0);
  const drawFrameRef = useRef<(index: number) => void>(() => undefined);

  const drawFrameForProgress = useCallback(
    (progress: number) => {
      const sequence = sequenceRef.current;

      if (!sequence) {
        return;
      }

      const frameProgress = clamp01((progress - videoStart) / (videoEnd - videoStart));
      const targetFrame = Math.min(
        sequence.frameCount - 1,
        Math.floor(frameProgress * sequence.frameCount),
      );
      const loadedFrame = findNearestLoadedFrameIndex(framesRef.current, targetFrame);

      currentTargetFrameRef.current = targetFrame;

      if (loadedFrame === null || loadedFrame === currentDrawnFrameRef.current) {
        return;
      }

      currentDrawnFrameRef.current = loadedFrame;
      window.requestAnimationFrame(() => drawFrameRef.current(loadedFrame));
    },
    [videoEnd, videoStart],
  );

  useEffect(() => {
    let cancelled = false;
    const markReady = () => {
      window.queueMicrotask(() => {
        if (cancelled) {
          return;
        }

        setReady(true);
        onProgress?.(1);
      });
    };
    const markNotReady = () => {
      window.queueMicrotask(() => {
        if (!cancelled) {
          setReady(false);
        }
      });
    };
    const canvas = canvasRef.current;

    if (!enabled) {
      sequenceRef.current = null;
      framesRef.current = [];
      markReady();
      return () => {
        cancelled = true;
      };
    }

    if (!canvas) {
      markReady();
      return () => {
        cancelled = true;
      };
    }

    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      markReady();
      return () => {
        cancelled = true;
      };
    }

    const sequence = selectSequence();
    let resizeFrame = 0;

    sequenceRef.current = sequence;
    framesRef.current = new Array<HTMLImageElement | undefined>(sequence.frameCount);
    currentDrawnFrameRef.current = 0;
    currentTargetFrameRef.current = 0;
    markNotReady();
    onProgress?.(0.08);

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
      const frameWidth = frame.naturalWidth || frame.width;
      const frameHeight = frame.naturalHeight || frame.height;

      if (frameWidth <= 0 || frameHeight <= 0) {
        return;
      }

      const scale = Math.max(canvasWidth / frameWidth, canvasHeight / frameHeight);
      const drawWidth = frameWidth * scale;
      const drawHeight = frameHeight * scale;
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
        drawFrame(currentDrawnFrameRef.current);
      });
    };

    const loadAndStoreFrame = async (index: number) => {
      const image = await loadFrameImage(getHomeHeroFrameUrl(sequence, index));

      if (cancelled) {
        return;
      }

      framesRef.current[index] = image;

      if (index === currentTargetFrameRef.current) {
        currentDrawnFrameRef.current = index;
        drawFrame(index);
      }
    };

    const loadFrameQueue = async (
      queue: number[],
      workerCount: number,
      onFrameLoaded?: (() => void) | undefined,
    ) => {
      let nextOrderIndex = 0;
      const workers = Array.from({ length: Math.min(workerCount, queue.length) }, async () => {
        while (!cancelled && nextOrderIndex < queue.length) {
          const frameIndex = queue[nextOrderIndex];

          nextOrderIndex += 1;

          if (frameIndex === undefined || framesRef.current[frameIndex]) {
            continue;
          }

          try {
            await loadAndStoreFrame(frameIndex);
            onFrameLoaded?.();
          } catch {
            // Missing frames degrade to the nearest loaded frame during scrub.
          }
        }
      });

      await Promise.all(workers);
    };

    const loadSequence = async () => {
      const { background, eager } = createFrameLoadPlan(sequence.frameCount);
      const firstFrame = eager.shift();

      if (firstFrame === undefined) {
        markReady();
        return;
      }

      try {
        await loadAndStoreFrame(firstFrame);
      } catch {
        if (!cancelled) {
          markReady();
        }

        return;
      }

      if (cancelled) {
        return;
      }

      drawFrame(0);
      onProgress?.(0.16);

      let loadedEagerFrames = 0;
      const totalEagerFrames = Math.max(1, eager.length);

      await loadFrameQueue(eager, EAGER_WORKERS, () => {
        loadedEagerFrames += 1;
        onProgress?.(0.16 + 0.78 * Math.min(1, loadedEagerFrames / totalEagerFrames));
      });

      if (cancelled) {
        return;
      }

      markReady();
      await loadFrameQueue(background, BACKGROUND_WORKERS);
    };

    drawFrameRef.current = drawFrame;
    resizeCanvas();
    window.addEventListener("resize", scheduleResize);
    void loadSequence();

    return () => {
      cancelled = true;
      window.removeEventListener("resize", scheduleResize);

      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }

      framesRef.current = [];
    };
  }, [canvasRef, enabled, onProgress]);

  return { drawFrameForProgress, ready };
}
