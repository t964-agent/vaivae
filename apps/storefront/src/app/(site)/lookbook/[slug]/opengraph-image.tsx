import { ImageResponse } from "next/og";

import { createBrandOgImage } from "@/lib/seo/og";
import { lookbookByHandleQuery } from "@/sanity/queries";

export const alt = "vaïvae lookbook preview";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

type LookbookOgImageProps = {
  params: Promise<{ slug: string }>;
};

type LookbookOgData = {
  coverImage?: OgSanityImage;
  eyebrow?: string | null;
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

async function getLookbook(slug: string): Promise<LookbookOgData | null> {
  if (!hasSanityEnv()) {
    return null;
  }

  const { sanityFetch } = await import("@/sanity/live");
  const { data } = await sanityFetch({
    params: { handle: slug },
    query: lookbookByHandleQuery,
    stega: false,
    tags: ["lookbook", `lookbook:${slug}`],
  });

  return data as LookbookOgData | null;
}

export default async function Image({ params }: LookbookOgImageProps) {
  const { slug } = await params;
  const lookbook = await getLookbook(slug).catch(() => null);
  const title = cleanText(lookbook?.title) ?? "Lookbook";
  const imageUrl = getImageUrl(lookbook?.seo?.ogImage ?? lookbook?.coverImage ?? null);

  return new ImageResponse(
    createBrandOgImage({
      eyebrow: "Lookbook",
      imageAlt: title,
      imageUrl,
      subtitle: cleanText(lookbook?.eyebrow) ?? "Seasonal studies in movement and form",
      title,
    }),
    size,
  );
}
