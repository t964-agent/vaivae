import type { MetadataRoute } from "next";

import type { StoreProduct } from "@/medusa/types";
import {
  collectionListQuery,
  journalListQuery,
  legalListQuery,
  lookbookListQuery,
  pageListQuery,
} from "@/sanity/queries";

const PRODUCT_SITEMAP_LIMIT = 100;
const PRODUCT_SITEMAP_MAX = 1000;

type SanityRoute = {
  _updatedAt?: string | null;
  endDate?: string | null;
  lastUpdated?: string | null;
  publishedAt?: string | null;
  releaseDate?: string | null;
  slug?: string | null;
};

function getBaseUrl(): string {
  return (process.env["NEXT_PUBLIC_BASE_URL"]?.trim() || "https://vaivae.com").replace(/\/+$/, "");
}

function createUrl(path: string, baseUrl: string): string {
  return new URL(path, `${baseUrl}/`).toString();
}

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

function getDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? fallback : date;
}

function getSanityRouteDate(route: SanityRoute, fallback: Date): Date {
  return getDate(
    route._updatedAt ??
      route.lastUpdated ??
      route.publishedAt ??
      route.releaseDate ??
      route.endDate,
    fallback,
  );
}

function normalizeSlug(slug: string | null | undefined): string | null {
  const normalized = slug?.trim().replace(/^\/+|\/+$/g, "");

  return normalized ? normalized : null;
}

function routeEntry({
  baseUrl,
  changeFrequency,
  lastModified,
  path,
  priority,
}: {
  baseUrl: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified: Date;
  path: string;
  priority: number;
}): MetadataRoute.Sitemap[number] {
  return {
    changeFrequency,
    lastModified,
    priority,
    url: createUrl(path, baseUrl),
  };
}

async function listSitemapProducts(): Promise<StoreProduct[]> {
  if (!hasMedusaEnv()) {
    return [];
  }

  const [{ getDefaultRegion }, { listProducts }] = await Promise.all([
    import("@/medusa/regions"),
    import("@/medusa/products"),
  ]);
  const region = await getDefaultRegion();
  const products: StoreProduct[] = [];

  for (let offset = 0; offset < PRODUCT_SITEMAP_MAX; offset += PRODUCT_SITEMAP_LIMIT) {
    const result = await listProducts({
      limit: PRODUCT_SITEMAP_LIMIT,
      offset,
      regionId: region.id,
    });

    products.push(...result.products);

    if (!result.hasMore || result.products.length === 0) {
      break;
    }
  }

  return products;
}

async function getSanityRoutes<T extends SanityRoute>(query: string, tag: string): Promise<T[]> {
  if (!hasSanityEnv()) {
    return [];
  }

  const { sanityFetch } = await import("@/sanity/live");
  const { data } = await sanityFetch({
    perspective: "published",
    query,
    stega: false,
    tags: [tag],
  });

  return Array.isArray(data) ? (data as T[]) : [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    routeEntry({
      baseUrl,
      changeFrequency: "weekly",
      lastModified: now,
      path: "/",
      priority: 1,
    }),
    routeEntry({
      baseUrl,
      changeFrequency: "daily",
      lastModified: now,
      path: "/products",
      priority: 0.9,
    }),
    routeEntry({
      baseUrl,
      changeFrequency: "weekly",
      lastModified: now,
      path: "/lookbook",
      priority: 0.8,
    }),
    routeEntry({
      baseUrl,
      changeFrequency: "weekly",
      lastModified: now,
      path: "/journal",
      priority: 0.7,
    }),
  ];
  const productRoutes: MetadataRoute.Sitemap = [];

  try {
    const products = await listSitemapProducts();
    const handles = new Set<string>();

    for (const product of products) {
      const handle = normalizeSlug(product.handle);

      if (!handle || handles.has(handle) || product.status === "draft") {
        continue;
      }

      handles.add(handle);
      productRoutes.push(
        routeEntry({
          baseUrl,
          changeFrequency: "weekly",
          lastModified: getDate(product.updated_at ?? product.created_at, now),
          path: `/products/${handle}`,
          priority: 0.9,
        }),
      );
    }
  } catch {
    // Keep the sitemap available even when Medusa is temporarily unreachable.
  }

  const [collections, lookbooks, journals, legalPages, pages] = await Promise.all([
    getSanityRoutes(collectionListQuery, "collection").catch(() => []),
    getSanityRoutes(lookbookListQuery, "lookbook").catch(() => []),
    getSanityRoutes(journalListQuery, "journal").catch(() => []),
    getSanityRoutes(legalListQuery, "legal").catch(() => []),
    getSanityRoutes(pageListQuery, "page").catch(() => []),
  ]);

  const sanityRoutes: MetadataRoute.Sitemap = [
    ...collections.flatMap((collection) => {
      const slug = normalizeSlug(collection.slug);

      return slug
        ? [
            routeEntry({
              baseUrl,
              changeFrequency: "monthly",
              lastModified: getDate(collection.publishedAt ?? collection._updatedAt, now),
              path: `/collections/${slug}`,
              priority: 0.8,
            }),
          ]
        : [];
    }),
    ...lookbooks.flatMap((lookbook) => {
      const slug = normalizeSlug(lookbook.slug);

      return slug
        ? [
            routeEntry({
              baseUrl,
              changeFrequency: "monthly",
              lastModified: getSanityRouteDate(lookbook, now),
              path: `/lookbook/${slug}`,
              priority: 0.75,
            }),
          ]
        : [];
    }),
    ...journals.flatMap((journal) => {
      const slug = normalizeSlug(journal.slug);

      return slug
        ? [
            routeEntry({
              baseUrl,
              changeFrequency: "monthly",
              lastModified: getSanityRouteDate(journal, now),
              path: `/journal/${slug}`,
              priority: 0.7,
            }),
          ]
        : [];
    }),
    ...[...legalPages, ...pages].flatMap((page) => {
      const slug = normalizeSlug(page.slug);

      return slug
        ? [
            routeEntry({
              baseUrl,
              changeFrequency: "monthly",
              lastModified: getSanityRouteDate(page, now),
              path: `/${slug}`,
              priority: 0.5,
            }),
          ]
        : [];
    }),
  ];

  return [...staticRoutes, ...productRoutes, ...sanityRoutes];
}
