import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PdpLayout } from "@/components/pdp/pdp-layout";
import { getProductByHandle, getProductRecommendations } from "@/medusa/products";
import { getDefaultRegion } from "@/medusa/regions";
import type { StoreProduct, StoreRegion } from "@/medusa/types";
import { getCurrentCustomer } from "@/medusa/customer";
import { getWishlist } from "@/medusa/wishlist";
import { getEditorialProduct, type EditorialProduct } from "@/lib/sanity/products";
import { breadcrumbJsonLd, jsonLdScriptProps } from "@/lib/seo/jsonld";
import { getProductJsonLd } from "@/lib/seo/product-jsonld";

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
  const ogImage = `/products/${data.product.handle}/opengraph-image`;

  return {
    alternates: {
      canonical: `/products/${data.product.handle}`,
    },
    description,
    openGraph: {
      description,
      images: [{ alt: data.product.title, height: 630, url: ogImage, width: 1200 }],
      title: data.product.title,
      type: "website",
      url: `/products/${data.product.handle}`,
    },
    robots: {
      follow: true,
      index: data.editorial?.seo?.noindex === true ? false : true,
    },
    title: data.product.title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [{ alt: data.product.title, url: ogImage }],
      title: `${data.product.title} — vaïvae`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const data = await getPdpData(handle);

  if (!data) {
    notFound();
  }

  const canonicalUrl = getCanonicalUrl(data.product.handle);
  const [customer, wishlistItems] = await Promise.all([
    getCurrentCustomer().catch(() => null),
    getWishlist().catch(() => []),
  ]);
  const jsonLd = getProductJsonLd({
    editorial: data.editorial,
    product: data.product,
    url: canonicalUrl,
  });

  return (
    <>
      <script {...jsonLdScriptProps(jsonLd)} />
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Shop", url: "/products" },
            { name: data.product.title, url: canonicalUrl },
          ]),
        )}
      />
      <PdpLayout
        editorial={data.editorial}
        isAuthenticated={Boolean(customer)}
        product={data.product}
        recommendations={data.recommendations}
        wishlistItems={wishlistItems.map((item) => ({
          itemId: item.id,
          variantId: item.product_variant_id,
        }))}
      />
    </>
  );
}
