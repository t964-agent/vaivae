import type { Metadata } from "next";
import Image from "next/image";

import { SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { Container, Stack } from "@/components/ui";
import { breadcrumbJsonLd, collectionPageJsonLd, jsonLdScriptProps } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";

const COLLECTION_TITLE = "Summer Fall 26";
const COLLECTION_SUBTITLE = "The Summer Sets";
const COLLECTION_PATH = "/collections/summer-fall-26";

const STATEMENT_PARAGRAPHS = [
  "The Summer Sets collection is both an introduction and a quiet declaration: the opening note of the House, marked by what is kept in and what is left out.",
  "Materials are tactile and intentional: soft-touch viscose, featherweight knit, raw-cut cotton, jersey that falls like water, raw materials rested rather than pressed. Their ease contrasts with their precision — a dichotomy that is quintessentially vaïvae.",
  "Logos are absent. Hardware is absent. There is no distraction. The focus is on the woman inside the cloth, one cloth that moves with her and never against her. Silhouettes shift with fabrics that breathe.",
  "Pieces arrive in pairs and travel apart. Wear them pool to table, hotel room to evening, suitcase to skin, always uncrushed.",
  "The collection lives in the spaces between cities and time, a wear between St Tropez and Dubai, between a beach day, a coffee run afternoon and an easy elegant night.",
] as const;

type RunwayFrame = {
  alt: string;
  aspectRatio: string;
  caption: string;
  src: string;
};

/**
 * Ten editorial frames composing the runway sequence.
 *
 * Drop final imagery into `apps/storefront/public/collections/summer-fall-26/`
 * using the filenames below. The layout is intentionally varied so the photos
 * read as an editorial, not a grid.
 */
const RUNWAY_FRAMES: readonly RunwayFrame[] = [
  {
    alt: "Summer Sets — Frame 01 — Opening look in soft-touch viscose.",
    aspectRatio: "16/10",
    caption: "Opening",
    src: "/collections/summer-fall-26/01.webp",
  },
  {
    alt: "Summer Sets — Frame 02 — Featherweight knit, raw-cut details.",
    aspectRatio: "4/5",
    caption: "Featherweight knit",
    src: "/collections/summer-fall-26/02.webp",
  },
  {
    alt: "Summer Sets — Frame 03 — Jersey that falls like water.",
    aspectRatio: "4/5",
    caption: "Jersey, like water",
    src: "/collections/summer-fall-26/03.webp",
  },
  {
    alt: "Summer Sets — Frame 04 — Raw-cut cotton at rest.",
    aspectRatio: "3/4",
    caption: "At rest",
    src: "/collections/summer-fall-26/04.webp",
  },
  {
    alt: "Summer Sets — Frame 05 — A composed silhouette in motion.",
    aspectRatio: "4/5",
    caption: "Composed",
    src: "/collections/summer-fall-26/05.webp",
  },
  {
    alt: "Summer Sets — Frame 06 — Covered, never concealed.",
    aspectRatio: "4/5",
    caption: "Covered",
    src: "/collections/summer-fall-26/06.webp",
  },
  {
    alt: "Summer Sets — Frame 07 — Pieces that travel apart.",
    aspectRatio: "16/10",
    caption: "Between cities",
    src: "/collections/summer-fall-26/07.webp",
  },
  {
    alt: "Summer Sets — Frame 08 — Pool to table.",
    aspectRatio: "3/4",
    caption: "Pool to table",
    src: "/collections/summer-fall-26/08.webp",
  },
  {
    alt: "Summer Sets — Frame 09 — Hotel room to evening.",
    aspectRatio: "3/4",
    caption: "Room to evening",
    src: "/collections/summer-fall-26/09.webp",
  },
  {
    alt: "Summer Sets — Frame 10 — Closing look. Quiet against attention.",
    aspectRatio: "3/4",
    caption: "Closing",
    src: "/collections/summer-fall-26/10.webp",
  },
];

const META_DESCRIPTION =
  "The Summer Sets — the opening note of vaïvae. Soft-touch viscose, featherweight knit, raw-cut cotton. Logos absent, hardware absent. Composed, covered, never concealed.";

export const metadata: Metadata = {
  alternates: { canonical: COLLECTION_PATH },
  description: META_DESCRIPTION,
  openGraph: {
    description: META_DESCRIPTION,
    title: `${COLLECTION_TITLE} — Collection — vaïvae`,
    type: "website",
    url: COLLECTION_PATH,
  },
  robots: { follow: true, index: true },
  title: `${COLLECTION_TITLE} — Collection`,
  twitter: {
    card: "summary_large_image",
    description: META_DESCRIPTION,
    title: `${COLLECTION_TITLE} — Collection — vaïvae`,
  },
};

function FrameCaption({ caption, index }: { caption: string; index: number }) {
  return (
    <figcaption className="mt-4 flex items-start justify-between gap-6 font-body text-xs tracking-[0.16em] text-on-light/50 uppercase">
      <span className="tabular-nums">{`${String(index + 1).padStart(2, "0")} / 10`}</span>
      <span className="max-w-md text-right">{caption}</span>
    </figcaption>
  );
}

type RunwayImageProps = {
  className?: string;
  frame: RunwayFrame;
  index: number;
  sizes: string;
};

function RunwayImage({ className, frame, index, sizes }: RunwayImageProps) {
  return (
    <figure className={cn("group", className)}>
      <div
        className="relative w-full overflow-hidden bg-on-light/5"
        style={{ aspectRatio: frame.aspectRatio }}
      >
        <Image
          alt={frame.alt}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.015]"
          fill
          sizes={sizes}
          src={frame.src}
        />
      </div>
      <FrameCaption caption={frame.caption} index={index} />
    </figure>
  );
}

export default function SummerFall26CollectionPage() {
  const heroFrame = RUNWAY_FRAMES[0];
  const pair1 = [RUNWAY_FRAMES[1], RUNWAY_FRAMES[2]] as const;
  const solo = RUNWAY_FRAMES[3];
  const pair2 = [RUNWAY_FRAMES[4], RUNWAY_FRAMES[5]] as const;
  const banner = RUNWAY_FRAMES[6];
  const trio = [RUNWAY_FRAMES[7], RUNWAY_FRAMES[8], RUNWAY_FRAMES[9]] as const;

  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: COLLECTION_TITLE, url: COLLECTION_PATH },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          collectionPageJsonLd({
            description: META_DESCRIPTION,
            name: COLLECTION_TITLE,
            url: COLLECTION_PATH,
          }),
        )}
      />

      <section
        aria-labelledby="collection-heading"
        className="relative isolate flex min-h-[88dvh] items-end overflow-hidden bg-oxblood text-on-dark"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(243,176,58,0.08),_transparent_55%)]"
        />
        <Container className="relative pt-40 pb-20 md:pb-28" variant="wide">
          <Stack className="max-w-5xl" gap={8}>
            <SectionEyebrow className="text-on-dark/55">Collection</SectionEyebrow>
            <SectionHeading
              as="h1"
              className="text-[clamp(3.5rem,11vw,12rem)] text-on-dark"
              id="collection-heading"
            >
              Summer Fall <em>26</em>
            </SectionHeading>
            <p className="font-display text-[clamp(1.5rem,2.6vw,2.5rem)] leading-tight font-light tracking-[-0.02em] text-on-dark/75 italic">
              {COLLECTION_SUBTITLE}
            </p>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="statement-heading" className="bg-cream py-24 md:py-32 lg:py-40">
        <Container variant="narrow">
          <Stack gap={10}>
            <SectionEyebrow id="statement-heading">A quiet declaration</SectionEyebrow>
            <Stack
              className="font-body text-[1.05rem] leading-8 text-on-light/80 md:text-lg md:leading-9"
              gap={6}
            >
              {STATEMENT_PARAGRAPHS.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </Stack>

            <div aria-hidden className="my-4 h-px w-16 bg-on-light/25" />

            <blockquote className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.15] font-light tracking-[-0.025em] text-on-light">
              <em className="text-accent-gold not-italic">Composed.</em>{" "}
              <em className="text-accent-gold not-italic">Covered.</em>{" "}
              <em className="text-accent-gold not-italic">Never concealed.</em>
            </blockquote>
            <p className="max-w-xl font-body text-base leading-7 text-on-light/65 md:text-lg">
              Modest held against the heat, quiet held against attention.
            </p>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="runway-heading" className="bg-cream pb-28 md:pb-40">
        <Container variant="wide">
          <Stack gap={16}>
            <Stack className="max-w-3xl" gap={4}>
              <SectionEyebrow>The runway</SectionEyebrow>
              <SectionHeading as="h2" className="text-4xl md:text-6xl" id="runway-heading">
                Ten <em>frames</em>
              </SectionHeading>
            </Stack>

            {heroFrame ? (
              <RunwayImage
                className="mx-auto w-full max-w-6xl"
                frame={heroFrame}
                index={0}
                sizes="(min-width: 1280px) 1100px, 95vw"
              />
            ) : null}

            <div className="grid gap-x-5 gap-y-12 md:grid-cols-2 lg:gap-x-8">
              {pair1.map((frame, offset) =>
                frame ? (
                  <RunwayImage
                    frame={frame}
                    index={1 + offset}
                    key={frame.src}
                    sizes="(min-width: 1024px) 46vw, 94vw"
                  />
                ) : null,
              )}
            </div>

            {solo ? (
              <RunwayImage
                className="mx-auto w-full max-w-2xl"
                frame={solo}
                index={3}
                sizes="(min-width: 768px) 640px, 92vw"
              />
            ) : null}

            <div className="grid gap-x-5 gap-y-12 md:grid-cols-2 lg:gap-x-8">
              {pair2.map((frame, offset) =>
                frame ? (
                  <RunwayImage
                    frame={frame}
                    index={4 + offset}
                    key={frame.src}
                    sizes="(min-width: 1024px) 46vw, 94vw"
                  />
                ) : null,
              )}
            </div>

            {banner ? (
              <RunwayImage
                className="mx-auto w-full max-w-6xl"
                frame={banner}
                index={6}
                sizes="(min-width: 1280px) 1100px, 95vw"
              />
            ) : null}

            <div className="grid gap-x-5 gap-y-12 md:grid-cols-3 lg:gap-x-6">
              {trio.map((frame, offset) =>
                frame ? (
                  <RunwayImage
                    frame={frame}
                    index={7 + offset}
                    key={frame.src}
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 31vw, 94vw"
                  />
                ) : null,
              )}
            </div>
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="credits-heading" className="bg-cream pb-24 md:pb-32">
        <Container variant="narrow">
          <div className="flex flex-col items-start gap-3 border-t border-on-light/15 pt-10 md:flex-row md:items-baseline md:justify-between">
            <SectionEyebrow id="credits-heading">Imagery</SectionEyebrow>
            <p className="font-body text-sm tracking-[0.14em] text-on-light/65 uppercase">
              IHAB — runway frames for vaïvae
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
