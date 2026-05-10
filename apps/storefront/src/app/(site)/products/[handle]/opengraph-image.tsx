import { ImageResponse } from "next/og";

import { createBrandOgImage } from "@/lib/seo/og";

export const alt = "vaïvae product preview";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

type ProductOgImageProps = {
  params: Promise<{ handle: string }>;
};

type OgSanityImage = {
  asset?: {
    url?: string | null;
  } | null;
} | null;

type ProductOgData = {
  id: string;
  images?: Array<{ url?: string | null }> | null;
  thumbnail?: string | null;
  title: string;
  variants?: Array<{
    calculated_price?: {
      calculated_amount?: number | null;
      currency_code?: string | null;
    } | null;
  }> | null;
};

type EditorialOgData = {
  editorialReady?: boolean | null;
  heroImage?: OgSanityImage;
  seo?: {
    ogImage?: OgSanityImage;
  } | null;
};

function hasMedusaEnv(): boolean {
  return Boolean(
    process.env["NEXT_PUBLIC_MEDUSA_BACKEND_URL"]?.trim() &&
    process.env["NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"]?.trim(),
  );
}

function hasSanityEnv(): boolean {
  return Boolean(
    process.env["NEXT_PUBLIC_SANITY_PROJECT_ID"]?.trim() &&
    process.env["NEXT_PUBLIC_SANITY_DATASET"]?.trim(),
  );
}

function getImageUrl(image: OgSanityImage): string | undefined {
  return image?.asset?.url?.trim() || undefined;
}

function getProductPrice(product: ProductOgData): string | undefined {
  const variant = product.variants?.find(
    (candidate) => typeof candidate.calculated_price?.calculated_amount === "number",
  );
  const amount = variant?.calculated_price?.calculated_amount;
  const currency = variant?.calculated_price?.currency_code?.trim().toUpperCase();

  if (typeof amount !== "number" || !currency) {
    return undefined;
  }

  return new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
  }).format(amount / 100);
}

async function getProduct(handle: string): Promise<ProductOgData | null> {
  if (!hasMedusaEnv()) {
    return null;
  }

  const [{ getDefaultRegion }, { getProductByHandle }] = await Promise.all([
    import("@/medusa/regions"),
    import("@/medusa/products"),
  ]);
  const region = await getDefaultRegion();

  return getProductByHandle(handle, region.id) as Promise<ProductOgData | null>;
}

async function getEditorialImage(productId: string): Promise<string | undefined> {
  if (!hasSanityEnv()) {
    return undefined;
  }

  const { getEditorialProduct } = await import("@/lib/sanity/products");
  const editorial = (await getEditorialProduct(productId).catch(
    () => null,
  )) as EditorialOgData | null;

  if (editorial?.editorialReady !== true) {
    return undefined;
  }

  return getImageUrl(editorial.heroImage ?? null) ?? getImageUrl(editorial.seo?.ogImage ?? null);
}

export default async function Image({ params }: ProductOgImageProps) {
  const { handle } = await params;
  const product = await getProduct(handle).catch(() => null);

  if (!product) {
    return new ImageResponse(
      createBrandOgImage({
        eyebrow: "Product",
        subtitle: "The Living Runway",
        title: "vaïvae",
      }),
      size,
    );
  }

  const editorialImage = await getEditorialImage(product.id);
  const imageUrl = editorialImage ?? product.thumbnail ?? product.images?.[0]?.url;
  const price = getProductPrice(product);

  return new ImageResponse(
    createBrandOgImage({
      eyebrow: "Product",
      imageAlt: product.title,
      imageUrl,
      subtitle: price ?? "Available soon",
      title: product.title,
    }),
    size,
  );
}
