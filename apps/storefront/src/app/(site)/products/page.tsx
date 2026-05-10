import type { Metadata } from "next";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

import { SectionBody, SectionEyebrow, SectionHeading } from "@/components/atoms/section-text";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductsFilterPanel } from "@/components/products/filter-panel";
import { Button, Container, HStack, Stack } from "@/components/ui";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScriptProps } from "@/lib/seo/jsonld";
import { listEditorialProducts } from "@/lib/sanity/products";
import {
  PRODUCT_PRICE_MAX_CENTS,
  loadProductsFiltersSearchParams,
  normalizeProductsFilters,
  serializeProductsFilters,
  type ProductSort,
  type ProductsFilters,
} from "@/lib/url-state/products-filters";
import { listProductCategories, listProducts } from "@/medusa/products";
import { getDefaultRegion } from "@/medusa/regions";
import type { StoreProduct, StoreProductCategory } from "@/medusa/types";

const PAGE_SIZE = 12;

type ProductsPageProps = {
  searchParams: Promise<SearchParams>;
};

type FilterPill = {
  href: string;
  label: string;
};

const SORT_LABELS: Record<ProductSort, string> = {
  alpha_asc: "A to Z",
  newest: "Newest",
  price_asc: "Price low",
  price_desc: "Price high",
};

function formatPieces(count: number): string {
  return count === 1 ? "1 piece" : `${count} pieces`;
}

function formatDollars(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(cents / 100);
}

function getCategoryLabel(handle: string, categories: StoreProductCategory[]): string {
  return categories.find((category) => category.handle === handle)?.name ?? handle;
}

function getProductsTitle(filters: ProductsFilters): string {
  if (filters.q) {
    return `Search results for "${filters.q}"`;
  }

  if (filters.categories.length === 1) {
    return "The Collection";
  }

  return "The Collection";
}

function getActiveFilterPills(
  filters: ProductsFilters,
  categories: StoreProductCategory[],
): FilterPill[] {
  const currentHref = serializeProductsFilters("/products", filters);
  const pills: FilterPill[] = [];

  if (filters.q) {
    pills.push({
      href: serializeProductsFilters(currentHref, { page: 1, q: null }),
      label: `Search: "${filters.q}"`,
    });
  }

  for (const handle of filters.categories) {
    pills.push({
      href: serializeProductsFilters(currentHref, {
        categories: filters.categories.filter((category) => category !== handle),
        page: 1,
      }),
      label: getCategoryLabel(handle, categories),
    });
  }

  if (filters.inStock) {
    pills.push({
      href: serializeProductsFilters(currentHref, { inStock: false, page: 1 }),
      label: "In stock",
    });
  }

  if (filters.priceMin > 0 || filters.priceMax < PRODUCT_PRICE_MAX_CENTS) {
    const min = filters.priceMin > 0 ? formatDollars(filters.priceMin) : "$0";
    const max =
      filters.priceMax < PRODUCT_PRICE_MAX_CENTS ? formatDollars(filters.priceMax) : "Any";

    pills.push({
      href: serializeProductsFilters(currentHref, {
        page: 1,
        priceMax: PRODUCT_PRICE_MAX_CENTS,
        priceMin: 0,
      }),
      label: `Price: ${min} - ${max}`,
    });
  }

  if (filters.sort !== "newest") {
    pills.push({
      href: serializeProductsFilters(currentHref, { page: 1, sort: "newest" }),
      label: `Sort: ${SORT_LABELS[filters.sort]}`,
    });
  }

  return pills;
}

async function getProductsData(filters: ProductsFilters): Promise<{
  categories: StoreProductCategory[];
  count: number;
  hasMore: boolean;
  products: StoreProduct[];
}> {
  const [regionResult, categoriesResult] = await Promise.allSettled([
    getDefaultRegion(),
    listProductCategories(),
  ]);
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];

  if (regionResult.status !== "fulfilled") {
    return { categories, count: 0, hasMore: false, products: [] };
  }

  try {
    const { count, hasMore, products } = await listProducts({
      categoryHandles: filters.categories,
      inStockOnly: filters.inStock,
      limit: filters.page * PAGE_SIZE,
      offset: 0,
      priceMax: filters.priceMax,
      priceMin: filters.priceMin,
      q: filters.q,
      regionId: regionResult.value.id,
      sort: filters.sort,
    });

    return { categories, count, hasMore, products };
  } catch {
    return { categories, count: 0, hasMore: false, products: [] };
  }
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const filters = normalizeProductsFilters(await loadProductsFiltersSearchParams(searchParams));
  const activeCategory = filters.categories.length === 1 ? filters.categories[0] : null;
  const canonical = serializeProductsFilters("/products", filters);
  const description =
    "Explore the vaïvae collection, refined by category, availability, price, and sort.";
  const title = filters.q
    ? `Search "${filters.q}" | Products`
    : activeCategory
      ? `${activeCategory} | Products`
      : "Products";

  return {
    alternates: {
      canonical,
    },
    description,
    openGraph: {
      description,
      title: `${title} — vaïvae`,
      type: "website",
      url: canonical,
    },
    robots: {
      follow: true,
      index: filters.q.length === 0,
    },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      title: `${title} — vaïvae`,
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const filters = normalizeProductsFilters(await loadProductsFiltersSearchParams(searchParams));
  const { categories, count, hasMore, products } = await getProductsData(filters);
  const editorial = await listEditorialProducts(products.map((product) => product.id));
  const activeFilterPills = getActiveFilterPills(filters, categories);
  const loadMoreHref = serializeProductsFilters("/products", {
    ...filters,
    page: filters.page + 1,
  });
  const productItems = products.flatMap((product) => {
    const handle = product.handle?.trim();

    return handle
      ? [
          {
            name: product.title?.trim() || handle,
            url: `/products/${handle}`,
          },
        ]
      : [];
  });

  return (
    <>
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: "Shop", url: "/products" },
          ]),
        )}
      />
      <script {...jsonLdScriptProps(itemListJsonLd(productItems, "vaïvae products"))} />
      <Container asChild variant="wide">
        <section aria-labelledby="products-heading" className="pt-28 pb-20 md:pt-36 md:pb-28">
          <Stack gap={12}>
            <Stack className="max-w-4xl" gap={6}>
              <SectionEyebrow>Shop</SectionEyebrow>
              <SectionHeading as="h1" id="products-heading">
                {getProductsTitle(filters)}
              </SectionHeading>
              <SectionBody>
                A considered edit of pieces made for movement, restraint, and quiet presence.
              </SectionBody>
            </Stack>

            <Stack gap={6}>
              <HStack align="start" className="gap-y-4" justify="between" wrap>
                <p aria-atomic="true" className="text-sm text-on-light/55" role="status">
                  {products.length < count
                    ? `${formatPieces(products.length)} of ${formatPieces(count)} shown`
                    : `${formatPieces(count)} shown`}
                </p>
                {activeFilterPills.length > 0 ? (
                  <Button asChild size="sm" variant="underline">
                    <Link href="/products">Clear all</Link>
                  </Button>
                ) : null}
              </HStack>

              {activeFilterPills.length > 0 ? (
                <HStack aria-label="Active filters" gap={2} wrap>
                  {activeFilterPills.map((pill) => (
                    <Link
                      key={`${pill.label}-${pill.href}`}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-on-light/15 px-3 py-1 text-xs tracking-[0.12em] text-on-light/65 uppercase transition-colors hover:border-on-light/35 hover:text-on-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
                      href={pill.href}
                    >
                      {pill.label}
                      <span aria-hidden>x</span>
                      <span className="sr-only">Remove filter</span>
                    </Link>
                  ))}
                </HStack>
              ) : null}
            </Stack>

            <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
              <ProductsFilterPanel categories={categories} resultCount={count} />
              <Stack gap={10}>
                <ProductGrid editorial={editorial} products={products} />
                {hasMore ? (
                  <div className="flex justify-center pt-4">
                    <Button asChild variant="ghost">
                      <Link href={loadMoreHref}>Load more</Link>
                    </Button>
                  </div>
                ) : null}
              </Stack>
            </div>
          </Stack>
        </section>
      </Container>
    </>
  );
}
