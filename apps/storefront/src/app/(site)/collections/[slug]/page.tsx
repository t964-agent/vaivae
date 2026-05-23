import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { Container, Stack } from "@/components/ui";
import { cleanText, getSanityImageUrl, truncateText } from "@/lib/editorial";
import { breadcrumbJsonLd, collectionPageJsonLd, jsonLdScriptProps } from "@/lib/seo/jsonld";
import { cn } from "@/lib/utils";
import { collectionByHandleQuery, collectionListQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { CollectionByHandleQueryResult } from "@/sanity/types";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

type Collection = NonNullable<CollectionByHandleQueryResult>;
type RunwayFrame = NonNullable<Collection["runwayFrames"]>[number];
type RunwayGroupKind = "banner" | "pair" | "solo" | "trio";
type RunwayGroup = {
  items: Array<{ frame: RunwayFrame; index: number }>;
  kind: RunwayGroupKind;
};

const FALLBACK_DESCRIPTION =
  "A vaïvae collection study told through restrained copy, runway frames, and cinematic editorial cadence.";

async function getCollection(slug: string, stega = true): Promise<CollectionByHandleQueryResult> {
  const { data } = await sanityFetch({
    params: { handle: slug },
    query: collectionByHandleQuery,
    ...(stega ? {} : { stega: false }),
    tags: ["collection", `collection:${slug}`],
  });

  return data;
}

function getStatementParagraphs(collection: Collection): string[] {
  return (
    collection.statement?.paragraphs?.flatMap((paragraph) => {
      const text = cleanText(paragraph);

      return text ? [text] : [];
    }) ?? []
  );
}

function getCollectionDescription(collection: Collection): string {
  const statement = getStatementParagraphs(collection).join(" ");

  return truncateText(collection.seo?.description ?? statement) ?? FALLBACK_DESCRIPTION;
}

function getPrimaryImage(collection: Collection) {
  return (
    collection.seo?.ogImage ??
    collection.runwayFrames?.find((frame) => frame.image?.asset)?.image ??
    null
  );
}

function getFrameCountLabel(count: number): string {
  return count === 10 ? "Ten" : String(count);
}

function getFrameAspectRatio(frame: RunwayFrame): string {
  return frame.aspectRatio ?? "4/5";
}

function createRunwayGroup(
  kind: RunwayGroupKind,
  frames: RunwayFrame[],
  start: number,
  count: number,
): RunwayGroup | null {
  const items = frames.slice(start, start + count).map((frame, offset) => ({
    frame,
    index: start + offset,
  }));

  return items.length === count ? { items, kind } : null;
}

function pushRunwayGroup(
  groups: RunwayGroup[],
  kind: RunwayGroupKind,
  frames: RunwayFrame[],
  start: number,
  count: number,
): void {
  const group = createRunwayGroup(kind, frames, start, count);

  if (group) {
    groups.push(group);
  }
}

function appendPairedGroups(groups: RunwayGroup[], frames: RunwayFrame[], start: number): void {
  for (let index = start; index < frames.length; ) {
    const remaining = frames.length - index;
    const count = remaining === 1 ? 1 : 2;

    pushRunwayGroup(groups, count === 1 ? "solo" : "pair", frames, index, count);
    index += count;
  }
}

function getRunwayGroups(frames: RunwayFrame[]): RunwayGroup[] {
  const groups: RunwayGroup[] = [];

  if (frames.length >= 10) {
    pushRunwayGroup(groups, "banner", frames, 0, 1);
    pushRunwayGroup(groups, "pair", frames, 1, 2);
    pushRunwayGroup(groups, "solo", frames, 3, 1);
    pushRunwayGroup(groups, "pair", frames, 4, 2);
    pushRunwayGroup(groups, "banner", frames, 6, 1);
    pushRunwayGroup(groups, "trio", frames, 7, 3);
    appendPairedGroups(groups, frames, 10);

    return groups;
  }

  pushRunwayGroup(groups, "banner", frames, 0, 1);
  appendPairedGroups(groups, frames, 1);

  return groups;
}

function getQuoteSegments(value: string | null | undefined): string[] {
  return (
    cleanText(value)
      ?.split(/(?<=\.)\s+/)
      .flatMap((segment) => {
        const text = cleanText(segment);

        return text ? [text] : [];
      }) ?? []
  );
}

function renderHeroHeadline(headline: string) {
  const match = /^(.*\D)(\d{2})$/.exec(headline.trim());

  if (!match) {
    return headline;
  }

  const prefix = match[1] ?? "";
  const season = match[2] ?? "";

  return (
    <>
      {prefix}
      <em>{season}</em>
    </>
  );
}

function FrameCaption({
  caption,
  index,
  total,
}: {
  caption: string | null;
  index: number;
  total: number;
}) {
  return (
    <figcaption className="mt-4 flex items-start justify-between gap-6 font-body text-xs tracking-[0.16em] text-on-light/50 uppercase">
      <span className="tabular-nums">{`${String(index + 1).padStart(2, "0")} / ${total}`}</span>
      <span className="max-w-md text-right">{caption}</span>
    </figcaption>
  );
}

type RunwayImageProps = {
  className?: string;
  frame: RunwayFrame;
  index: number;
  sizes: string;
  total: number;
};

function RunwayImage({ className, frame, index, sizes, total }: RunwayImageProps) {
  return (
    <figure className={cn("group", className)}>
      <div
        className="relative w-full overflow-hidden bg-on-light/5"
        style={{ aspectRatio: getFrameAspectRatio(frame) }}
      >
        {frame.image?.asset ? (
          <VaivaeImage
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.015]"
            image={frame.image}
            sizes={sizes}
            width={1600}
          />
        ) : (
          <div
            aria-label={`Runway frame ${index + 1} image pending`}
            className="size-full bg-on-light/5"
            role="img"
          />
        )}
      </div>
      <FrameCaption caption={frame.caption} index={index} total={total} />
    </figure>
  );
}

function RunwayFrameGroup({ group, total }: { group: RunwayGroup; total: number }) {
  switch (group.kind) {
    case "banner": {
      const item = group.items[0];

      return item ? (
        <RunwayImage
          className="mx-auto w-full max-w-6xl"
          frame={item.frame}
          index={item.index}
          sizes="(min-width: 1280px) 1100px, 95vw"
          total={total}
        />
      ) : null;
    }
    case "solo": {
      const item = group.items[0];

      return item ? (
        <RunwayImage
          className="mx-auto w-full max-w-2xl"
          frame={item.frame}
          index={item.index}
          sizes="(min-width: 768px) 640px, 92vw"
          total={total}
        />
      ) : null;
    }
    case "trio":
      return (
        <div className="grid gap-x-5 gap-y-12 md:grid-cols-3 lg:gap-x-6">
          {group.items.map((item) => (
            <RunwayImage
              frame={item.frame}
              index={item.index}
              key={item.frame._key}
              sizes="(min-width: 1024px) 30vw, (min-width: 768px) 31vw, 94vw"
              total={total}
            />
          ))}
        </div>
      );
    case "pair":
      return (
        <div className="grid gap-x-5 gap-y-12 md:grid-cols-2 lg:gap-x-8">
          {group.items.map((item) => (
            <RunwayImage
              frame={item.frame}
              index={item.index}
              key={item.frame._key}
              sizes="(min-width: 1024px) 46vw, 94vw"
              total={total}
            />
          ))}
        </div>
      );
  }
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    perspective: "published",
    query: collectionListQuery,
    stega: false,
    tags: ["collection"],
  }).catch(() => ({ data: [] }));

  return data.flatMap((collection) => (collection.slug ? [{ slug: collection.slug }] : []));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollection(slug, false).catch(() => null);

  if (!collection) {
    return {
      alternates: { canonical: `/collections/${slug}` },
      title: "Collection",
    };
  }

  const title = cleanText(collection.seo?.title) ?? cleanText(collection.title) ?? "Collection";
  const description = getCollectionDescription(collection);
  const canonicalPath = `/collections/${collection.slug ?? slug}`;
  const imageSource = getPrimaryImage(collection);
  const image = getSanityImageUrl(imageSource);
  const imageAlt = cleanText(imageSource?.alt) ?? title;

  return {
    alternates: { canonical: canonicalPath },
    description,
    openGraph: {
      description,
      images: image ? [{ alt: imageAlt, height: 630, url: image, width: 1200 }] : undefined,
      title: `${title} — Collection — vaïvae`,
      type: "website",
      url: canonicalPath,
    },
    robots: {
      follow: true,
      index: collection.seo?.noindex === true ? false : true,
    },
    title: `${title} — Collection`,
    twitter: {
      card: "summary_large_image",
      description,
      images: image ? [{ alt: imageAlt, url: image }] : undefined,
      title: `${title} — Collection — vaïvae`,
    },
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = await getCollection(slug);

  if (!collection) {
    notFound();
  }

  const title = cleanText(collection.title) ?? "Untitled collection";
  const canonicalPath = `/collections/${collection.slug ?? slug}`;
  const description = getCollectionDescription(collection);
  const heroEyebrow = cleanText(collection.hero?.eyebrow) ?? "Collection";
  const heroHeadline = cleanText(collection.hero?.headline) ?? title;
  const heroSubtitle = cleanText(collection.hero?.subtitle);
  const statementParagraphs = getStatementParagraphs(collection);
  const quoteSegments = getQuoteSegments(collection.statement?.closingQuote);
  const closingLine = cleanText(collection.statement?.closingLine);
  const runwayFrames = collection.runwayFrames ?? [];
  const runwayGroups = getRunwayGroups(runwayFrames);
  const runwayFrameCount = runwayFrames.length;
  const credits = cleanText(collection.credits);
  const primaryImage = getPrimaryImage(collection);

  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: title, url: canonicalPath },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          collectionPageJsonLd({
            description,
            image: getSanityImageUrl(primaryImage),
            name: title,
            url: canonicalPath,
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
            <SectionEyebrow className="text-on-dark/55">{heroEyebrow}</SectionEyebrow>
            <SectionHeading
              as="h1"
              className="text-[clamp(3.5rem,11vw,12rem)] text-on-dark"
              id="collection-heading"
            >
              {renderHeroHeadline(heroHeadline)}
            </SectionHeading>
            {heroSubtitle ? (
              <p className="font-display text-[clamp(1.5rem,2.6vw,2.5rem)] leading-tight font-light tracking-[-0.02em] text-on-dark/75 italic">
                {heroSubtitle}
              </p>
            ) : null}
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="statement-heading" className="bg-cream py-24 md:py-32 lg:py-40">
        <Container variant="narrow">
          <Stack gap={10}>
            <SectionEyebrow id="statement-heading">A quiet declaration</SectionEyebrow>
            {statementParagraphs.length ? (
              <Stack
                className="font-body text-[1.05rem] leading-8 text-on-light/80 md:text-lg md:leading-9"
                gap={6}
              >
                {statementParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </Stack>
            ) : null}

            {quoteSegments.length || closingLine ? (
              <div aria-hidden className="my-4 h-px w-16 bg-on-light/25" />
            ) : null}

            {quoteSegments.length ? (
              <blockquote className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.15] font-light tracking-[-0.025em] text-on-light">
                {quoteSegments.map((segment) => (
                  <em className="text-accent-gold not-italic" key={segment}>
                    {segment}{" "}
                  </em>
                ))}
              </blockquote>
            ) : null}
            {closingLine ? (
              <p className="max-w-xl font-body text-base leading-7 text-on-light/65 md:text-lg">
                {closingLine}
              </p>
            ) : null}
          </Stack>
        </Container>
      </section>

      <section aria-labelledby="runway-heading" className="bg-cream pb-28 md:pb-40">
        <Container variant="wide">
          <Stack gap={16}>
            <Stack className="max-w-3xl" gap={4}>
              <SectionEyebrow>The runway</SectionEyebrow>
              <SectionHeading as="h2" className="text-4xl md:text-6xl" id="runway-heading">
                {getFrameCountLabel(runwayFrameCount)} <em>frames</em>
              </SectionHeading>
            </Stack>

            {runwayGroups.map((group, index) => (
              <RunwayFrameGroup group={group} key={`${group.kind}-${index}`} total={runwayFrameCount} />
            ))}
          </Stack>
        </Container>
      </section>

      {credits ? (
        <section aria-labelledby="credits-heading" className="bg-cream pb-24 md:pb-32">
          <Container variant="narrow">
            <div className="flex flex-col items-start gap-3 border-t border-on-light/15 pt-10 md:flex-row md:items-baseline md:justify-between">
              <SectionEyebrow id="credits-heading">Imagery</SectionEyebrow>
              <p className="font-body text-sm tracking-[0.14em] text-on-light/65 uppercase">
                {credits}
              </p>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
