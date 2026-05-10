import { stegaClean } from "@sanity/client/stega";
import type { SanityImageSource } from "@sanity/image-url";

import type { PageBuilderModuleOf } from "@/components/page-builder/types";
import { urlFor } from "@/sanity/image";
import type { SanityImage } from "@/sanity/types";

export type EditorialSeo = {
  description?: string | null;
  keywords?: string[] | null;
  noindex?: boolean | null;
  ogImage?: SanityImage | null;
  title?: string | null;
};

export type ProductRailProduct = NonNullable<
  PageBuilderModuleOf<"productRail">["products"]
>[number];

type ProductRailOptions = {
  eyebrow?: string | null;
  heading: string;
  intro?: string | null;
  key: string;
  products: ProductRailProduct[];
};

export function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function truncateText(
  value: string | null | undefined,
  maxLength = 155,
): string | undefined {
  const text = cleanText(value);

  if (!text) {
    return undefined;
  }

  return text.length > maxLength ? `${text.slice(0, maxLength - 3).trim()}...` : text;
}

export function formatEditorialDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" },
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export function getSanityImageUrl(image: SanityImage | null | undefined): string | undefined {
  if (!image?.asset) {
    return undefined;
  }

  return urlFor(image as SanityImageSource)
    .width(1200)
    .height(630)
    .fit("crop")
    .url();
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(stegaClean(value)).replaceAll("<", "\\u003c");
}

export function uniqueProductReferences(products: ProductRailProduct[]): ProductRailProduct[] {
  const seen = new Set<string>();
  const unique: ProductRailProduct[] = [];

  for (const product of products) {
    const key = cleanText(product.handle) ?? product._id;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(product);
  }

  return unique;
}

export function createProductRailModule({
  eyebrow,
  heading,
  intro,
  key,
  products,
}: ProductRailOptions): PageBuilderModuleOf<"productRail"> {
  return {
    _key: key,
    _type: "productRail",
    columns: 3,
    cta: null,
    density: "compact",
    eyebrow: eyebrow ?? null,
    heading,
    intro: intro ?? null,
    layout: "carousel",
    products,
  };
}
