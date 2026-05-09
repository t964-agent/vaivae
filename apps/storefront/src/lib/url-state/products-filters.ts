import {
  createLoader,
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  type inferParserType,
} from "nuqs/server";

export const PRODUCT_PRICE_MAX_CENTS = 10000_00;
const PRODUCT_SORT_OPTION_VALUES = ["newest", "price_asc", "price_desc", "alpha_asc"] as const;

export type ProductSort = (typeof PRODUCT_SORT_OPTION_VALUES)[number];

export const PRODUCT_SORT_OPTIONS: ProductSort[] = [...PRODUCT_SORT_OPTION_VALUES];

export const productsFiltersSearchParams = {
  q: parseAsString.withDefault(""),
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  colors: parseAsArrayOf(parseAsString).withDefault([]),
  materials: parseAsArrayOf(parseAsString).withDefault([]),
  inStock: parseAsBoolean.withDefault(false),
  priceMin: parseAsInteger.withDefault(0),
  priceMax: parseAsInteger.withDefault(PRODUCT_PRICE_MAX_CENTS),
  sort: parseAsStringEnum(PRODUCT_SORT_OPTIONS).withDefault("newest"),
  page: parseAsInteger.withDefault(1),
};

export type ProductsFilters = inferParserType<typeof productsFiltersSearchParams>;

export const loadProductsFiltersSearchParams = createLoader(productsFiltersSearchParams);
export const productsFiltersSearchParamsCache = createSearchParamsCache(
  productsFiltersSearchParams,
);
export const serializeProductsFilters = createSerializer(productsFiltersSearchParams, {
  clearOnDefault: true,
  processUrlSearchParams(searchParams) {
    searchParams.sort();

    return searchParams;
  },
});

function cleanList(values: readonly string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort();
}

export function normalizeProductsFilters(filters: ProductsFilters): ProductsFilters {
  const priceMin = Math.max(0, filters.priceMin);
  const rawPriceMax = filters.priceMax <= 0 ? PRODUCT_PRICE_MAX_CENTS : filters.priceMax;
  const priceMax = Math.min(PRODUCT_PRICE_MAX_CENTS, Math.max(rawPriceMax, priceMin));

  return {
    categories: cleanList(filters.categories),
    colors: cleanList(filters.colors),
    inStock: filters.inStock,
    materials: cleanList(filters.materials),
    page: Math.max(1, filters.page),
    priceMax,
    priceMin,
    q: filters.q.trim(),
    sort: filters.sort,
  };
}

export function hasActiveProductsFilters(filters: ProductsFilters): boolean {
  return (
    filters.q.trim().length > 0 ||
    filters.categories.length > 0 ||
    filters.colors.length > 0 ||
    filters.materials.length > 0 ||
    filters.inStock ||
    filters.priceMin > 0 ||
    filters.priceMax < PRODUCT_PRICE_MAX_CENTS ||
    filters.sort !== "newest" ||
    filters.page > 1
  );
}
