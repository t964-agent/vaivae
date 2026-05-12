export type HomeHeroSequence = {
  frameCount: number;
  frameHeight: number;
  framePath: string;
  frameWidth: number;
  poster: string;
};

export const HOME_HERO_SEQUENCE_MEDIA_QUERY = "(max-width: 767px), (orientation: portrait)";

export const HOME_HERO_SEQUENCE = {
  desktop: {
    frameCount: 144,
    frameHeight: 810,
    framePath: "/home/hero-sequence/desktop/frame-",
    frameWidth: 1440,
    poster: "/home/hero-sequence/poster-desktop.webp",
  },
  mobile: {
    frameCount: 144,
    frameHeight: 1280,
    framePath: "/home/hero-sequence/mobile/frame-",
    frameWidth: 720,
    poster: "/home/hero-sequence/poster-mobile.webp",
  },
} satisfies Record<"desktop" | "mobile", HomeHeroSequence>;

export function getHomeHeroFrameUrl(sequence: HomeHeroSequence, index: number): string {
  return `${sequence.framePath}${String(index + 1).padStart(4, "0")}.webp`;
}
