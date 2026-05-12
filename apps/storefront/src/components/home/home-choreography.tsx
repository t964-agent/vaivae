"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { HomeCta } from "./home-cta";
import { HomeCursorLens } from "./home-cursor-lens";
import { HomeHero } from "./home-hero";
import { HomeLoader } from "./home-loader";
import { HomeMarquee } from "./home-marquee";
import { HomeScrollSection } from "./home-scroll-section";
import {
  HomeServerFallback,
  type HomeContent,
  type HomeScrollAnimation,
} from "./home-server-fallback";
import { HomeVideoStage } from "./home-video-stage";
import { useImageSequenceCanvas } from "./hooks/use-image-sequence-canvas";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type HomeChoreographyProps = {
  content: HomeContent;
  onReady?: (() => void) | undefined;
};

type SectionInitialState = {
  opacity: number;
  rotation: number;
  scale: number;
  x: number;
  y: number;
};

type SectionUpdater = (progress: number) => void;

const PI = Math.PI;
const HERO_EXIT_START = 0.02;
const HERO_EXIT_END = 0.075;
const WIPE_START = 0.02;
const WIPE_END = 0.085;
const WIPE_RADIUS_PEAK = 82;
const VIDEO_START = 0.02;
const VIDEO_END = 0.945;

const sectionInitialStates = {
  "clip-reveal": { opacity: 0, rotation: 0, scale: 1, x: 0, y: 50 },
  "fade-up": { opacity: 0, rotation: 0, scale: 1, x: 0, y: 60 },
  "rotate-in": { opacity: 0, rotation: 2, scale: 1, x: 0, y: 50 },
  "scale-up": { opacity: 0, rotation: 0, scale: 0.92, x: 0, y: 0 },
  "slide-left": { opacity: 0, rotation: 0, scale: 1, x: -60, y: 40 },
  "slide-right": { opacity: 0, rotation: 0, scale: 1, x: 60, y: 40 },
} satisfies Record<HomeScrollAnimation, SectionInitialState>;

function clamp01(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function ramp(progress: number, start: number, end: number): number {
  if (end <= start) {
    return progress >= end ? 1 : 0;
  }

  const t = clamp01((progress - start) / (end - start));

  return 0.5 - 0.5 * Math.cos(t * PI);
}

function rampOut(progress: number, start: number, end: number): number {
  return 1 - ramp(progress, start, end);
}

function readSectionAnimation(value: string | undefined): HomeScrollAnimation {
  if (value && value in sectionInitialStates) {
    return value as HomeScrollAnimation;
  }

  return "fade-up";
}

function setupSectionAnimation(section: HTMLElement): SectionUpdater | null {
  const animation = readSectionAnimation(section.dataset["animation"]);
  const persist = section.dataset["persist"] === "true";
  const enter = Number.parseFloat(section.dataset["enter"] ?? "0") / 100;
  const leave = Number.parseFloat(section.dataset["leave"] ?? "0") / 100;
  const range = leave - enter;
  const children = Array.from(section.querySelectorAll<HTMLElement>(".home-section-child"));

  if (children.length === 0 || !Number.isFinite(range) || range <= 0) {
    return null;
  }

  const initial = sectionInitialStates[animation];
  const blockInStart = enter - 0.005;
  const blockInEnd = enter + range * 0.05;
  const blockOutStart = leave - range * 0.05;
  const blockOutEnd = leave + 0.005;
  const childRevealStart = enter + range * 0.02;
  const childRevealEnd = enter + range * 0.5;
  const childExitStart = leave - range * 0.2;
  const childExitEnd = leave - range * 0.02;
  const staggerSpread = (childRevealEnd - childRevealStart) * 0.35;
  const perChildLength = childRevealEnd - childRevealStart - staggerSpread;
  const childIn = children.map((_, index) => {
    const offset = (children.length === 1 ? 0 : index / (children.length - 1)) * staggerSpread;

    return {
      end: childRevealStart + offset + perChildLength,
      offset,
      start: childRevealStart + offset,
    };
  });
  const childOut = childIn.map(({ offset }) => ({
    end: childExitEnd,
    start: childExitStart + offset * 0.5,
  }));
  const lastValues = children.map(() => -1);

  gsap.set(children, initial);
  section.style.opacity = "0";

  return (progress: number) => {
    let blockOpacity = 0;

    if (progress < blockInStart) {
      blockOpacity = 0;
    } else if (progress < blockInEnd) {
      blockOpacity = ramp(progress, blockInStart, blockInEnd);
    } else if (progress < blockOutStart) {
      blockOpacity = 1;
    } else if (progress < blockOutEnd) {
      blockOpacity = persist ? 1 : rampOut(progress, blockOutStart, blockOutEnd);
    } else {
      blockOpacity = persist ? 1 : 0;
    }

    section.style.opacity = blockOpacity.toFixed(3);

    if (blockOpacity <= 0) {
      children.forEach((child, index) => {
        if (lastValues[index] !== 0) {
          lastValues[index] = 0;
          child.style.opacity = "0";
        }
      });
      return;
    }

    children.forEach((child, index) => {
      const inWindow = childIn[index];
      const outWindow = childOut[index];

      if (!inWindow || !outWindow) {
        return;
      }

      let value = ramp(progress, inWindow.start, inWindow.end);

      if (!persist) {
        value *= rampOut(progress, outWindow.start, outWindow.end);
      }

      if (Math.abs(value - (lastValues[index] ?? -1)) < 0.003) {
        return;
      }

      lastValues[index] = value;

      const inverse = 1 - value;
      const x = initial.x * inverse;
      const y = initial.y * inverse;
      const rotation = initial.rotation * inverse;
      const scale = 1 + (initial.scale - 1) * inverse;

      child.style.opacity = value.toFixed(3);
      child.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotate(${rotation.toFixed(2)}deg)`;
    });
  };
}

export function HomeChoreography({ content, onReady }: HomeChoreographyProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const videoWrapRef = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduceMotion = useReducedMotion() === true;
  const motionEnabled = !reduceMotion;
  const [loaderProgress, setLoaderProgress] = useState(motionEnabled ? 0 : 1);
  const [loaderHidden, setLoaderHidden] = useState(!motionEnabled);
  const hasMarkedReadyRef = useRef(false);
  const markReady = useCallback(() => {
    if (hasMarkedReadyRef.current) {
      return;
    }

    hasMarkedReadyRef.current = true;
    setLoaderProgress(1);
    setLoaderHidden(true);
    onReady?.();
  }, [onReady]);
  const handleCaptureProgress = useCallback((progress: number) => {
    setLoaderProgress(Math.min(1, Math.max(0, progress)));
  }, []);
  const imageSequence = useImageSequenceCanvas({
    canvasRef,
    enabled: motionEnabled,
    onProgress: handleCaptureProgress,
    videoEnd: VIDEO_END,
    videoStart: VIDEO_START,
  });

  useEffect(() => {
    if (loaderHidden) {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [loaderHidden]);

  useEffect(() => {
    if (!motionEnabled) {
      markReady();
      return;
    }

    if (!imageSequence.ready) {
      return;
    }

    const hideTimer = window.setTimeout(() => {
      markReady();
    }, 250);

    return () => window.clearTimeout(hideTimer);
  }, [imageSequence.ready, markReady, motionEnabled]);

  useEffect(() => {
    if (!motionEnabled || !imageSequence.ready) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.25,
      easing: (time: number) => Math.min(1, 1.001 - 2 ** (-10 * time)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });
    const updateLenis = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, [imageSequence.ready, motionEnabled]);

  useGSAP(
    () => {
      if (!motionEnabled || !imageSequence.ready) {
        return;
      }

      const root = rootRef.current;
      const scrollContainer = scrollContainerRef.current;
      const hero = heroRef.current;
      const videoWrap = videoWrapRef.current;
      const marquee = marqueeRef.current;

      if (!root || !scrollContainer || !hero || !videoWrap) {
        return;
      }

      const scrollIndicator = hero.querySelector<HTMLElement>(".home-scroll-indicator");
      const sectionUpdaters = Array.from(root.querySelectorAll<HTMLElement>(".home-scroll-section"))
        .map(setupSectionAnimation)
        .filter((updater): updater is SectionUpdater => updater !== null);
      const marqueeMotion = marquee?.querySelector<HTMLElement>(".home-marquee-motion") ?? null;
      const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTimeline
        .from(hero.querySelector(".home-hero-label"), { duration: 0.85, opacity: 0, y: 24 }, 0.05)
        .from(
          hero.querySelectorAll(".home-hero-word"),
          { duration: 1.1, ease: "power4.out", opacity: 0, stagger: 0.11, y: 90 },
          0.15,
        )
        .from(
          hero.querySelector(".home-hero-tagline"),
          { duration: 0.85, opacity: 0, y: 24 },
          0.85,
        );

      if (scrollIndicator) {
        scrollIndicator.style.opacity = "0";
        gsap.to(scrollIndicator, { delay: 1.3, duration: 0.9, ease: "power2.out", opacity: 0.7 });
      }

      const updateHeroAndWipe = (progress: number) => {
        const heroOpacity = rampOut(progress, HERO_EXIT_START, HERO_EXIT_END);
        const wipe = ramp(progress, WIPE_START, WIPE_END);

        hero.style.opacity = heroOpacity.toFixed(3);
        hero.style.pointerEvents = heroOpacity < 0.02 ? "none" : "auto";
        videoWrap.style.clipPath = `circle(${(wipe * WIPE_RADIUS_PEAK).toFixed(2)}% at 50% 50%)`;

        if (scrollIndicator && progress >= 0.001) {
          scrollIndicator.style.opacity = (0.7 * rampOut(progress, 0.002, 0.03)).toFixed(3);
        }
      };

      const updateMarquee = (progress: number) => {
        if (!marquee) {
          return;
        }

        const enter = Number.parseFloat(marquee.dataset["enter"] ?? "0.10");
        const leave = Number.parseFloat(marquee.dataset["leave"] ?? "0.92");
        const speed = Number.parseFloat(marquee.dataset["scrollSpeed"] ?? "-55");
        const fade = 0.06;
        let opacity = 0;

        if (progress < enter - fade) {
          opacity = 0;
        } else if (progress < enter) {
          opacity = ramp(progress, enter - fade, enter);
        } else if (progress < leave) {
          opacity = 1;
        } else if (progress < leave + fade) {
          opacity = rampOut(progress, leave, leave + fade);
        }

        marquee.style.opacity = opacity.toFixed(3);

        if (marqueeMotion) {
          marqueeMotion.style.transform = `translate3d(${(speed * progress).toFixed(2)}%, 0, 0)`;
        }
      };

      const trigger = ScrollTrigger.create({
        end: "bottom bottom",
        onUpdate: (self) => {
          const progress = self.progress;

          updateHeroAndWipe(progress);
          imageSequence.drawFrameForProgress(progress);
          updateMarquee(progress);
          sectionUpdaters.forEach((update) => update(progress));
        },
        scrub: true,
        start: "top top",
        trigger: scrollContainer,
      });

      const refreshTimers = [50, 400, 1000].map((delay) =>
        window.setTimeout(() => ScrollTrigger.refresh(), delay),
      );
      const refreshOnLoad = () => ScrollTrigger.refresh();

      window.addEventListener("load", refreshOnLoad);

      return () => {
        trigger.kill();
        heroTimeline.kill();
        refreshTimers.forEach((timer) => window.clearTimeout(timer));
        window.removeEventListener("load", refreshOnLoad);
      };
    },
    { dependencies: [imageSequence.ready, motionEnabled], scope: rootRef },
  );

  if (reduceMotion) {
    return <HomeServerFallback content={content} />;
  }

  return (
    <section
      ref={rootRef}
      className={cn(
        "relative isolate bg-oxblood text-on-dark",
        loaderHidden ? "" : "max-h-[100dvh] overflow-hidden",
      )}
      data-home-choreography
    >
      <HomeLoader hidden={loaderHidden} progress={loaderProgress} />
      <HomeHero content={content.hero} ref={heroRef} />
      <HomeVideoStage ref={videoWrapRef} canvasReady={imageSequence.ready} canvasRef={canvasRef} />
      <HomeMarquee content={content.marquee} ref={marqueeRef} />
      <HomeCursorLens disabled={!motionEnabled} />
      <div ref={scrollContainerRef} className="relative z-[2] h-[900vh] w-full max-md:h-[600vh]">
        {content.chapters.map((chapter) => (
          <HomeScrollSection chapter={chapter} key={chapter.key} />
        ))}
        <HomeCta cta={content.cta} />
      </div>
    </section>
  );
}

export default HomeChoreography;
