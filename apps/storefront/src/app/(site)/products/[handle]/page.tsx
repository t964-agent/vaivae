import type { SanityImageSource } from "@sanity/image-url";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PdpLayout } from "@/components/pdp/pdp-layout";
import { getProductByHandle, getProductRecommendations } from "@/medusa/products";
import { getDefaultRegion } from "@/medusa/regions";
import type { StoreProduct, StoreRegion } from "@/medusa/types";
import { getEditorialProduct, type EditorialProduct } from "@/lib/sanity/products";
import { getProductJsonLd } from "@/lib/seo/product-jsonld";
import { urlFor } from "@/sanity/image";
import type { SanityImage } from "@/sanity/types";

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

type PdpData = {
  editorial: EditorialProduct;
  product: StoreProduct;
  recommendations: StoreProduct[];
  region: StoreRegion;
};

function getBaseUrl(): string {
  return process.env["NEXT_PUBLIC_BASE_URL"]?.trim() || "https://vaivae.com";
}

function truncateDescription(value: string | null | undefined): string | undefined {
  const description = value?.trim();

  if (!description) {
    return undefined;
  }

  return description.length > 155 ? `${description.slice(0, 152).trim()}...` : description;
}

function getSanityImageUrl(image: SanityImage | null | undefined): string | undefined {
  if (!image?.asset) {
    return undefined;
  }

  return urlFor(image as SanityImageSource)
    .width(1200)
    .height(630)
    .fit("crop")
    .url();
}

function getOgImage(product: StoreProduct, editorial: EditorialProduct): string | undefined {
  const editorialImage =
    editorial?.editorialReady === true
      ? (getSanityImageUrl(editorial.heroImage) ?? getSanityImageUrl(editorial.seo?.ogImage))
      : undefined;

  return editorialImage ?? product.images?.[0]?.url ?? product.thumbnail ?? undefined;
}

function getMetadataDescription(
  product: StoreProduct,
  editorial: EditorialProduct,
): string | undefined {
  const editorialDescription =
    editorial?.editorialReady === true
      ? editorial.oneLineHook?.trim() || editorial.seo?.description?.trim()
      : undefined;

  return editorialDescription || truncateDescription(product.description);
}

function getCanonicalUrl(handle: string): string {
  return new URL(`/products/${handle}`, getBaseUrl()).toString();
}

function serializeJsonLd(value: ReturnType<typeof getProductJsonLd>): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

async function getPdpData(handle: string): Promise<PdpData | null> {
  const region = await getDefaultRegion();
  const product = await getProductByHandle(handle, region.id);

  if (!product) {
    return null;
  }

  const [editorial, recommendations] = await Promise.all([
    getEditorialProduct(product.id),
    getProductRecommendations({ limit: 6, productId: product.id, regionId: region.id }).catch(
      () => [],
    ),
  ]);

  return { editorial, product, recommendations, region };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const data = await getPdpData(handle).catch(() => null);

  if (!data) {
    return {
      alternates: {
        canonical: `/products/${handle}`,
      },
      title: "Product",
    };
  }

  const description = getMetadataDescription(data.product, data.editorial);
  const ogImage = getOgImage(data.product, data.editorial);

  return {
    alternates: {
      canonical: `/products/${data.product.handle}`,
    },
    description,
    openGraph: {
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      title: data.product.title,
      type: "website",
      url: `/products/${data.product.handle}`,
    },
    robots: {
      follow: true,
      index: data.editorial?.seo?.noindex === true ? false : true,
    },
    title: data.product.title,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const data = await getPdpData(handle);

  if (!data) {
    notFound();
  }

  const canonicalUrl = getCanonicalUrl(data.product.handle);
  const jsonLd = getProductJsonLd({
    editorial: data.editorial,
    product: data.product,
    url: canonicalUrl,
  });

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        type="application/ld+json"
      />
      <PdpLayout
        editorial={data.editorial}
        product={data.product}
        recommendations={data.recommendations}
      />
    </>
  );
}
