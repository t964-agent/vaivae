import { ImageResponse } from "next/og";

import { createBrandOgImage } from "@/lib/seo/og";
import { capsuleByHandleQuery } from "@/sanity/queries";

export const alt = "vaïvae capsule preview";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

type CapsuleOgImageProps = {
  params: Promise<{ slug: string }>;
};

type CapsuleOgData = {
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

async function getCapsule(slug: string): Promise<CapsuleOgData | null> {
  if (!hasSanityEnv()) {
    return null;
  }

  const { sanityFetch } = await import("@/sanity/live");
  const { data } = await sanityFetch({
    params: { handle: slug },
    query: capsuleByHandleQuery,
    stega: false,
    tags: ["capsule", `capsule:${slug}`],
  });

  return data as CapsuleOgData | null;
}

export default async function Image({ params }: CapsuleOgImageProps) {
  const { slug } = await params;
  const capsule = await getCapsule(slug).catch(() => null);
  const title = cleanText(capsule?.title) ?? "Capsule";
  const imageUrl = getImageUrl(capsule?.seo?.ogImage ?? capsule?.coverImage ?? null);

  return new ImageResponse(
    createBrandOgImage({
      eyebrow: "Capsule",
      imageAlt: title,
      imageUrl,
      subtitle: cleanText(capsule?.eyebrow) ?? "A seasonal vaïvae world",
      title,
    }),
    size,
  );
}
