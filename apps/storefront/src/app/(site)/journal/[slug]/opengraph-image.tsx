import { ImageResponse } from "next/og";

import { createBrandOgImage } from "@/lib/seo/og";
import { journalEntryQuery } from "@/sanity/queries";

export const alt = "vaïvae journal preview";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

type JournalOgImageProps = {
  params: Promise<{ slug: string }>;
};

type JournalOgEntry = {
  author?: string | null;
  coverImage?: OgSanityImage;
  seo?: { ogImage?: OgSanityImage } | null;
  title?: string | null;
};

type OgSanityImage = {
  asset?: {
    url?: string | null;
  } | null;
} | null;

function cleanText(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function getImageUrl(image: OgSanityImage): string | undefined {
  return image?.asset?.url?.trim() || undefined;
}

function hasSanityEnv(): boolean {
  return Boolean(
    process.env["NEXT_PUBLIC_SANITY_PROJECT_ID"]?.trim() &&
    process.env["NEXT_PUBLIC_SANITY_DATASET"]?.trim(),
  );
}

async function getJournalEntry(slug: string): Promise<JournalOgEntry | null> {
  if (!hasSanityEnv()) {
    return null;
  }

  const { sanityFetch } = await import("@/sanity/live");
  const { data } = await sanityFetch({
    params: { slug },
    query: journalEntryQuery,
    stega: false,
    tags: ["journal", `journal:${slug}`],
  });

  return data as JournalOgEntry | null;
}

export default async function Image({ params }: JournalOgImageProps) {
  const { slug } = await params;
  const entry = await getJournalEntry(slug).catch(() => null);
  const title = cleanText(entry?.title) ?? "Journal";
  const author = cleanText(entry?.author);
  const imageUrl = getImageUrl(entry?.seo?.ogImage ?? entry?.coverImage ?? null);

  return new ImageResponse(
    createBrandOgImage({
      eyebrow: "Journal",
      imageAlt: title,
      imageUrl,
      subtitle: author ? `By ${author}` : "Field notes from vaïvae",
      title,
    }),
    size,
  );
}
