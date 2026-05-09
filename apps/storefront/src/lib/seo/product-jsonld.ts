import "server-only";

import type { EditorialProduct } from "@/lib/sanity/products";
import type { StoreProduct, StoreProductVariant } from "@/medusa/types";

type ProductJsonLdInput = {
  editorial: EditorialProduct;
  product: StoreProduct;
  url: string;
};

type OfferJsonLd = {
  "@type": "Offer";
  availability: string;
  price: string;
  priceCurrency: string;
  sku?: string | undefined;
  url: string;
};

type ProductJsonLd = {
  "@context": "https://schema.org";
  "@type": "Product";
  brand: {
    "@type": "Brand";
    name: string;
  };
  description?: string | undefined;
  image?: string[] | undefined;
  name: string;
  offers?: OfferJsonLd | undefined;
  productID: string;
  sku?: string | undefined;
};

function isVariantPurchasable(variant: StoreProductVariant | null | undefined): boolean {
  if (!variant) {
    return false;
  }

  return (
    variant.manage_inventory === false ||
    variant.allow_backorder === true ||
    (variant.inventory_quantity ?? 0) > 0
  );
}

function getPrimaryVariant(product: StoreProduct): StoreProductVariant | null {
  const variants = product.variants ?? [];

  return (
    variants.find(
      (variant) =>
        isVariantPurchasable(variant) &&
        typeof variant.calculated_price?.calculated_amount === "number" &&
        Boolean(variant.calculated_price.currency_code),
    ) ??
    variants.find(
      (variant) =>
        typeof variant.calculated_price?.calculated_amount === "number" &&
        Boolean(variant.calculated_price.currency_code),
    ) ??
    variants[0] ??
    null
  );
}

function getAvailability(variant: StoreProductVariant | null): string {
  if (!variant || !isVariantPurchasable(variant)) {
    return "https://schema.org/OutOfStock";
  }

  if (variant.allow_backorder === true) {
    return "https://schema.org/BackOrder";
  }

  if (variant.manage_inventory === false) {
    return "https://schema.org/InStock";
  }

  const inventoryQuantity = variant.inventory_quantity ?? 0;

  return inventoryQuantity > 0 && inventoryQuantity <= 2
    ? "https://schema.org/LimitedAvailability"
    : "https://schema.org/InStock";
}

function addUrl(urls: Set<string>, url: string | null | undefined): void {
  const normalizedUrl = url?.trim();

  if (normalizedUrl) {
    urls.add(normalizedUrl);
  }
}

function getImageUrls(product: StoreProduct, editorial: EditorialProduct): string[] {
  const urls = new Set<string>();

  if (editorial?.editorialReady === true) {
    addUrl(urls, editorial.heroImage?.asset?.url);

    for (const image of editorial.gallery ?? []) {
      addUrl(urls, image.asset?.url);
    }
  }

  addUrl(urls, product.thumbnail);

  for (const image of product.images ?? []) {
    addUrl(urls, image.url);
  }

  return [...urls];
}

function getDescription(product: StoreProduct, editorial: EditorialProduct): string | undefined {
  const editorialDescription =
    editorial?.editorialReady === true ? editorial.oneLineHook?.trim() : undefined;
  const productDescription = product.description?.trim();

  return editorialDescription || productDescription || undefined;
}

function getOffer(
  product: StoreProduct,
  variant: StoreProductVariant | null,
  url: string,
): OfferJsonLd | undefined {
  const amount = variant?.calculated_price?.calculated_amount;
  const currencyCode = variant?.calculated_price?.currency_code?.trim().toUpperCase();

  if (typeof amount !== "number" || !currencyCode) {
    return undefined;
  }

  return {
    "@type": "Offer",
    availability: getAvailability(variant),
    price: (amount / 100).toFixed(2),
    priceCurrency: currencyCode,
    sku: variant?.sku?.trim() || product.id,
    url,
  };
}

export function getProductJsonLd({ editorial, product, url }: ProductJsonLdInput): ProductJsonLd {
  const variant = getPrimaryVariant(product);
  const images = getImageUrls(product, editorial);
  const offer = getOffer(product, variant, url);
  const sku = variant?.sku?.trim() || product.id;
  const description = getDescription(product, editorial);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: {
      "@type": "Brand",
      name: "vaïvae",
    },
    ...(description ? { description } : {}),
    ...(images.length > 0 ? { image: images } : {}),
    name: product.title,
    ...(offer ? { offers: offer } : {}),
    productID: product.id,
    sku,
  };
}
