import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RichText } from "@/components/atoms/rich-text";
import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { VaivaeImage } from "@/components/atoms/vaivae-image";
import { LookbookCard } from "@/components/cards/lookbook-card";
import { resolvePageBuilderContext } from "@/components/page-builder/context";
import { ProductRail } from "@/components/page-builder/modules/product-rail";
import { asPortableText } from "@/components/page-builder/utils";
import { Container, HStack, Stack } from "@/components/ui";
import {
  cleanText,
  createProductRailModule,
  formatEditorialDate,
  getSanityImageUrl,
  serializeJsonLd,
  truncateText,
  uniqueProductReferences,
  type ProductRailProduct,
} from "@/lib/editorial";
import { journalEntryQuery, journalListQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { JournalEntryQueryResult } from "@/sanity/types";

type JournalEntryPageProps = {
  params: Promise<{ slug: string }>;
};

function getBaseUrl(): string {
  return process.env["NEXT_PUBLIC_BASE_URL"]?.trim() || "https://vaivae.com";
}

async function getJournalEntry(slug: string, stega = true): Promise<JournalEntryQueryResult> {
  const { data } = await sanityFetch({
    params: { slug },
    query: journalEntryQuery,
    ...(stega ? {} : { stega: false }),
    tags: ["journal", `journal:${slug}`],
  });

  return data;
}

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    perspective: "published",
    query: journalListQuery,
    stega: false,
    tags: ["journal"],
  }).catch(() => ({ data: [] }));

  return data.flatMap((entry) => (entry.slug ? [{ slug: entry.slug }] : []));
}

export async function generateMetadata({ params }: JournalEntryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getJournalEntry(slug, false).catch(() => null);

  if (!entry) {
    return {
      alternates: { canonical: `/journal/${slug}` },
      title: "Journal",
    };
  }

  const title = cleanText(entry.seo?.title) ?? cleanText(entry.title) ?? "Journal";
  const description =
    truncateText(entry.seo?.description ?? entry.excerpt ?? entry.subtitle) ??
    "An editorial field note from vaïvae.";
  const canonicalPath = `/journal/${entry.slug ?? slug}`;
  const image = getSanityImageUrl(entry.seo?.ogImage ?? entry.coverImage);
  const imageAlt = cleanText(entry.seo?.ogImage?.alt) ?? cleanText(entry.coverImage?.alt) ?? title;
  const author = cleanText(entry.author);

  return {
    alternates: { canonical: canonicalPath },
    description,
    openGraph: {
      authors: author ? [author] : undefined,
      description,
      images: image ? [{ alt: imageAlt, height: 630, url: image, width: 1200 }] : undefined,
      modifiedTime: entry._updatedAt,
      publishedTime: entry.publishedAt ?? undefined,
      tags: entry.tags ?? undefined,
      title: `${title} — vaïvae`,
      type: "article",
      url: canonicalPath,
    },
    robots: {
      follow: true,
      index: entry.seo?.noindex === true ? false : true,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: image ? [{ alt: imageAlt, url: image }] : undefined,
      title: `${title} — vaïvae`,
    },
  };
}

export default async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const { slug } = await params;
  const entry = await getJournalEntry(slug);

  if (!entry) {
    notFound();
  }

  const title = cleanText(entry.title) ?? "Untitled journal entry";
  const description = cleanText(entry.subtitle) ?? cleanText(entry.excerpt);
  const publishedAt = formatEditorialDate(entry.publishedAt, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const relatedProducts = uniqueProductReferences(
    (entry.relatedProducts ?? []) as ProductRailProduct[],
  );
  const productRail = relatedProducts.length
    ? createProductRailModule({
        eyebrow: "Related pieces",
        heading: "From the story",
        key: "journal-related-products",
        products: relatedProducts,
      })
    : null;
  const context = await resolvePageBuilderContext(productRail ? [productRail] : []);
  const canonicalUrl = new URL(`/journal/${entry.slug ?? slug}`, getBaseUrl()).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    author: entry.author
      ? {
          "@type": "Person",
          name: entry.author,
        }
      : undefined,
    dateModified: entry._updatedAt,
    datePublished: entry.publishedAt ?? undefined,
    description: cleanText(entry.excerpt) ?? description ?? undefined,
    headline: title,
    image: getSanityImageUrl(entry.coverImage),
    keywords: entry.tags?.join(", ") || undefined,
    mainEntityOfPage: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: "vaïvae",
      url: getBaseUrl(),
    },
    url: canonicalUrl,
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        type="application/ld+json"
      />
      <article>
        <Container asChild variant="wide">
          <header className="pt-28 pb-14 md:pt-36 md:pb-20">
            <Stack gap={10}>
              <Stack className="max-w-5xl" gap={6}>
                <SectionEyebrow>{entry.eyebrow ?? "Journal"}</SectionEyebrow>
                <SectionHeading as="h1">{title}</SectionHeading>
                {description ? <SectionBody>{description}</SectionBody> : null}
                <HStack className="text-xs tracking-[0.16em] text-on-light/45 uppercase" gap={3} wrap>
                  {entry.author ? <span>{entry.author}</span> : null}
                  {entry.author && publishedAt ? <span aria-hidden>·</span> : null}
                  {publishedAt ? <time dateTime={entry.publishedAt ?? undefined}>{publishedAt}</time> : null}
                </HStack>
              </Stack>
              {entry.coverImage?.asset ? (
                <VaivaeImage
                  className="aspect-[16/10] size-full object-cover"
                  image={entry.coverImage}
                  priority
                  sizes="(min-width: 1536px) 1400px, 94vw"
                  width={1600}
                />
              ) : null}
            </Stack>
          </header>
        </Container>

        {entry.body?.length ? (
          <Container asChild variant="narrow">
            <div className="pb-20 md:pb-28">
              <RichText value={asPortableText(entry.body)} />
            </div>
          </Container>
        ) : null}
      </article>

      {entry.relatedLookbooks?.length ? (
        <Container asChild variant="wide">
          <section aria-labelledby="related-lookbooks-heading" className="py-20 md:py-28">
            <Stack gap={10}>
              <Stack className="max-w-3xl" gap={4}>
                <SectionEyebrow>Continue</SectionEyebrow>
                <SectionHeading as="h2" className="text-5xl md:text-7xl" id="related-lookbooks-heading">
                  Related lookbooks
                </SectionHeading>
              </Stack>
              <div className="grid gap-5 md:grid-cols-2 lg:gap-8">
                {entry.relatedLookbooks.slice(0, 2).map((lookbook) => (
                  <LookbookCard key={lookbook._id} lookbook={lookbook} />
                ))}
              </div>
            </Stack>
          </section>
        </Container>
      ) : null}

      {productRail ? (
        <ProductRail data={productRail} medusaProducts={context.medusaProducts} />
      ) : null}

      {entry.tags?.length ? (
        <Container asChild variant="narrow">
          <footer className="pb-20 md:pb-28">
            <HStack aria-label="Journal tags" gap={2} wrap>
              {entry.tags.map((tag) => (
                <span
                  className="rounded-full border border-on-light/15 px-3 py-2 font-body text-xs tracking-[0.14em] text-on-light/55 uppercase"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </HStack>
          </footer>
        </Container>
      ) : null}
    </>
  );
}
