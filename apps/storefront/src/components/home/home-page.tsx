import type { PortableTextBlock } from "@portabletext/types";

import { resolveChromeLink } from "@/components/site/site-link";
import { homePageQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { HomePageQueryResult } from "@/sanity/types";

import { HomeChoreographyLoader } from "./home-choreography-loader";
import type {
  HomeContent,
  HomeCtaContent,
  HomeHeroContent,
  HomeMarqueeContent,
  HomeScrollChapterContent,
} from "./home-server-fallback";

type HomePageModule = NonNullable<NonNullable<HomePageQueryResult>["pageBuilder"]>[number];
type HomeHeroFilmModule = Extract<HomePageModule, { _type: "heroFilm" }>;

const HOME_TAGS = ["sanity:home"] as const;

const FALLBACK_HERO = {
  eyebrow: "Drop 01 — May 2026",
  heading: "The <em>living</em> runway.",
  scrollIndicator: true,
  subhead:
    "An AI muse emerges from the brand world itself — fabric, light and color resolving into a season. Scroll to enter.",
} satisfies HomeHeroContent;

const FALLBACK_MARQUEE = {
  direction: "left",
  enabled: true,
  separator: "·",
  speed: 60,
  text: "Liquid form · Living cloth · A new house · Liquid form · Living cloth · A new house · Liquid form · Living cloth · A new house",
} satisfies HomeMarqueeContent;

const FALLBACK_CHAPTERS = [
  {
    animation: "slide-left",
    bodyText:
      "No model placed on top of the brand. The muse emerges from inside the world — heat, hair, fabric, breath — resolving frame by frame as you move.",
    enter: 0.12,
    eyebrow: "001 / Formation",
    heading: "Out of the <em>gradient</em>, a figure forms.",
    key: "formation",
    leave: 0.27,
    note: "Generated · Live · One-of-one",
    side: "left",
  },
  {
    animation: "slide-right",
    bodyText:
      "A draped bias gown in hand-dyed silk. The first heat of the season — slow, low-burning, alive at the hem.",
    enter: 0.27,
    eyebrow: "002 / Look 01",
    heading: "<em>Terracotta.</em><br/>Earth, set in motion.",
    key: "terracotta",
    leave: 0.42,
    note: "From $1,180 · Made in Florence",
    side: "right",
  },
  {
    animation: "clip-reveal",
    bodyText:
      "A long-line jacket in raw silk twill. Cuts that hold air. Color that arrives quietly and refuses to leave.",
    enter: 0.42,
    eyebrow: "003 / Look 02",
    heading: "<em>Glacial.</em><br/>Cool intelligence.",
    key: "glacial",
    leave: 0.57,
    note: "From $1,420 · Limited to 80 pieces",
    side: "left",
  },
  {
    animation: "fade-up",
    bodyText:
      "An open-weave knit dress, hand-finished. The exact temperature of late afternoon, made wearable.",
    enter: 0.57,
    eyebrow: "004 / Look 03",
    heading: "<em>Coral.</em><br/>Warmth without weight.",
    key: "coral",
    leave: 0.72,
    note: "From $980 · Available May 12",
    side: "right",
  },
  {
    animation: "rotate-in",
    bodyText:
      "A floor-length linen overcoat. The runway resolves into something you can actually wear into the rest of your life.",
    enter: 0.72,
    eyebrow: "005 / Look 04",
    heading: "<em>Linen.</em><br/>The last word.",
    key: "linen",
    leave: 0.89,
    note: "From $1,620 · Pre-order opens today",
    side: "left",
  },
] satisfies HomeScrollChapterContent[];

const FALLBACK_CTA = {
  eyebrow: "Drop 01 — Available now",
  heading: "Enter the<br/><em>collection.</em>",
  href: "/products",
  label: "Shop the Living Runway",
  meta: ["Worldwide shipping", "·", "Pre-order through May 24"],
  targetBlank: false,
} satisfies HomeCtaContent;

function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function getHeroContent(hero: HomeHeroFilmModule | null | undefined): HomeHeroContent {
  return {
    eyebrow: cleanText(hero?.eyebrow) ?? FALLBACK_HERO.eyebrow,
    heading: cleanText(hero?.heading) ?? FALLBACK_HERO.heading,
    scrollIndicator: hero?.scrollIndicator ?? FALLBACK_HERO.scrollIndicator,
    subhead: cleanText(hero?.subhead) ?? FALLBACK_HERO.subhead,
  };
}

function getMarqueeContent(hero: HomeHeroFilmModule | null | undefined): HomeMarqueeContent {
  return {
    direction: hero?.marquee?.direction ?? FALLBACK_MARQUEE.direction,
    enabled: hero?.marquee?.enabled ?? FALLBACK_MARQUEE.enabled,
    separator: cleanText(hero?.marquee?.separator) ?? FALLBACK_MARQUEE.separator,
    speed: hero?.marquee?.speed ?? FALLBACK_MARQUEE.speed,
    text: cleanText(hero?.marquee?.text) ?? FALLBACK_MARQUEE.text,
  };
}

function getChapterContent(
  hero: HomeHeroFilmModule | null | undefined,
): HomeScrollChapterContent[] {
  return FALLBACK_CHAPTERS.map((fallback, index) => {
    const source = hero?.chapters?.[index];
    const sourceBody = source?.body?.length ? (source.body as PortableTextBlock[]) : undefined;

    return {
      animation: fallback.animation,
      bodyBlocks: sourceBody,
      bodyText: sourceBody ? "" : fallback.bodyText,
      enter: fallback.enter,
      eyebrow: cleanText(source?.eyebrow) ?? fallback.eyebrow,
      heading: cleanText(source?.heading) ?? fallback.heading,
      key: source?._key ?? fallback.key,
      leave: fallback.leave,
      note: cleanText(source?.note) ?? fallback.note,
      side: source?.align ?? fallback.side,
    };
  });
}

function getCtaContent(hero: HomeHeroFilmModule | null | undefined): HomeCtaContent {
  const terminalCta = hero?.terminalCta;
  const primaryCta = terminalCta?.primaryCta;
  const resolved = primaryCta?.link ? resolveChromeLink(primaryCta.link) : null;

  return {
    body: cleanText(terminalCta?.body) ?? undefined,
    eyebrow: cleanText(terminalCta?.eyebrow) ?? FALLBACK_CTA.eyebrow,
    heading: cleanText(terminalCta?.heading) ?? FALLBACK_CTA.heading,
    href: resolved?.href ?? FALLBACK_CTA.href,
    label: cleanText(primaryCta?.label) ?? FALLBACK_CTA.label,
    meta: FALLBACK_CTA.meta,
    targetBlank: resolved?.targetBlank ?? FALLBACK_CTA.targetBlank,
  };
}

function normalizeHomeContent(hero: HomeHeroFilmModule | null | undefined): HomeContent {
  return {
    chapters: getChapterContent(hero),
    cta: getCtaContent(hero),
    hero: getHeroContent(hero),
    marquee: getMarqueeContent(hero),
  };
}

function isHeroFilmModule(module: HomePageModule): module is HomeHeroFilmModule {
  return module._type === "heroFilm";
}

async function getHomePageData(): Promise<HomePageQueryResult | null> {
  try {
    const { data } = await sanityFetch({ query: homePageQuery, tags: [...HOME_TAGS] });

    return data;
  } catch {
    return null;
  }
}

export async function HomePage() {
  const homePage = await getHomePageData();
  const modules = homePage?.pageBuilder ?? [];
  const hero = modules.find(isHeroFilmModule);
  const content = normalizeHomeContent(hero);

  return <HomeChoreographyLoader content={content} />;
}
