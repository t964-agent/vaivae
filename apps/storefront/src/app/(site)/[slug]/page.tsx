import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalLayout } from "@/components/legal/legal-layout";
import { PageLayout } from "@/components/legal/page-layout";
import { cleanText, getSanityImageUrl, truncateText } from "@/lib/editorial";
import { legalBySlugQuery, legalListQuery, pageBySlugQuery, pageListQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { LegalBySlugQueryResult, PageBySlugQueryResult } from "@/sanity/types";

type SlugPageProps = {
  params: Promise<{ slug: string }>;
};

type LegalDocument = NonNullable<LegalBySlugQueryResult>;
type PageDocument = NonNullable<PageBySlugQueryResult>;

type SlugContent =
  | { document: LegalDocument; type: "legal" }
  | { document: PageDocument; type: "page" };

async function getLegalDocument(slug: string, stega = true): Promise<LegalBySlugQueryResult> {
  const { data } = await sanityFetch({
    params: { slug },
    query: legalBySlugQuery,
    ...(stega ? {} : { stega: false }),
    tags: ["legal", `legal:${slug}`],
  });

  return data;
}

async function getPageDocument(slug: string, stega = true): Promise<PageBySlugQueryResult> {
  const { data } = await sanityFetch({
    params: { slug },
    query: pageBySlugQuery,
    ...(stega ? {} : { stega: false }),
    tags: ["page", `page:${slug}`],
  });

  return data;
}

async function getSlugContent(slug: string, stega = true): Promise<SlugContent | null> {
  const legalDocument = await getLegalDocument(slug, stega);

  if (legalDocument) {
    return { document: legalDocument, type: "legal" };
  }

  const pageDocument = await getPageDocument(slug, stega);

  if (pageDocument) {
    return { document: pageDocument, type: "page" };
  }

  return null;
}

function getDescription(content: SlugContent): string {
  const description = truncateText(content.document.seo?.description);

  if (description) {
    return description;
  }

  return content.type === "legal"
    ? "Legal information and policy details from vaïvae."
    : "An editorial page from vaïvae.";
}

function getTitle(content: SlugContent): string {
  return cleanText(content.document.seo?.title) ?? cleanText(content.document.title) ?? "vaïvae";
}

function shouldNoindex(content: SlugContent): boolean {
  return (
    content.document.seo?.noindex === true ||
    (content.type === "legal" && content.document.kind === "imprint")
  );
}

export async function generateStaticParams() {
  const [legalResult, pageResult] = await Promise.all([
    sanityFetch({
      perspective: "published",
      query: legalListQuery,
      stega: false,
      tags: ["legal"],
    }).catch(() => ({ data: [] })),
    sanityFetch({
      perspective: "published",
      query: pageListQuery,
      stega: false,
      tags: ["page"],
    }).catch(() => ({ data: [] })),
  ]);
  const slugs = new Set<string>();

  for (const document of [...legalResult.data, ...pageResult.data]) {
    if (document.slug) {
      slugs.add(document.slug);
    }
  }

  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSlugContent(slug, false).catch(() => null);

  if (!content) {
    notFound();
  }

  const title = getTitle(content);
  const description = getDescription(content);
  const canonicalPath = `/${content.document.slug ?? slug}`;
  const image = getSanityImageUrl(content.document.seo?.ogImage);
  const imageAlt = cleanText(content.document.seo?.ogImage?.alt) ?? title;

  return {
    alternates: { canonical: canonicalPath },
    description,
    openGraph: {
      description,
      images: image ? [{ alt: imageAlt, height: 630, url: image, width: 1200 }] : undefined,
      title: `${title} — vaïvae`,
      type: "website",
      url: canonicalPath,
    },
    robots: {
      follow: true,
      index: !shouldNoindex(content),
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

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;
  const content = await getSlugContent(slug);

  if (!content) {
    notFound();
  }

  if (content.type === "legal") {
    return <LegalLayout doc={content.document} />;
  }

  return <PageLayout doc={content.document} />;
}
