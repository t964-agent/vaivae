import "server-only";

import { unstable_cache } from "next/cache";

import { PRODUCT_PRICE_MAX_CENTS, type ProductSort } from "@/lib/url-state/products-filters";
import { getMedusaClient } from "@/medusa/client";
import { getDefaultRegion } from "@/medusa/regions";
import type {
  StoreCollection,
  StoreProduct,
  StoreProductCategory,
  StoreProductVariant,
} from "@/medusa/types";

const PRODUCT_LIST_FIELDS =
  "id,title,handle,thumbnail,status,created_at,*variants,+variants.inventory_quantity,*variants.calculated_price";
const PRODUCT_DETAIL_FIELDS =
  "id,title,handle,subtitle,description,thumbnail,status,created_at,updated_at,*options,*images,*variants,+variants.inventory_quantity,*variants.calculated_price,*categories,*collection";
const DEFAULT_PRODUCT_LIMIT = 12;
const MAX_POST_FILTER_PRODUCTS = 100;

type ProductListQuery = NonNullable<
  Parameters<ReturnType<typeof getMedusaClient>["store"]["product"]["list"]>[0]
>;

export type ListProductsInput = {
  categoryHandles?: string[] | undefined;
  collectionHandles?: string[] | undefined;
  inStockOnly?: boolean | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  priceMax?: number | undefined;
  priceMin?: number | undefined;
  q?: string | undefined;
  regionId: string;
  sort?: ProductSort | undefined;
};

export type ProductListResult = {
  count: number;
  hasMore: boolean;
  products: StoreProduct[];
};

function normalizeStrings(values: readonly string[] | undefined): string[] {
  return Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean))).sort();
}

function normalizeLimit(limit: number | undefined): number {
  if (typeof limit !== "number" || !Number.isFinite(limit)) {
    return DEFAULT_PRODUCT_LIMIT;
  }

  return Math.min(MAX_POST_FILTER_PRODUCTS, Math.max(1, Math.round(limit)));
}

function normalizeOffset(offset: number | undefined): number {
  if (typeof offset !== "number" || !Number.isFinite(offset)) {
    return 0;
  }

  return Math.max(0, Math.round(offset));
}

function getNativeOrder(sort: ProductSort): string | undefined {
  if (sort === "alpha_asc") {
    return "title";
  }

  if (sort === "newest") {
    return "-created_at";
  }

  return undefined;
}

function getVariantPrice(variant: StoreProductVariant): number | null {
  const amount = variant.calculated_price?.calculated_amount;

  return typeof amount === "number" ? amount : null;
}

function getProductPrice(product: StoreProduct): number | null {
  for (const variant of product.variants ?? []) {
    const amount = getVariantPrice(variant);

    if (amount !== null) {
      return amount;
    }
  }

  return null;
}

function isProductAvailable(product: StoreProduct): boolean {
  return (product.variants ?? []).some(
    (variant) =>
      variant.manage_inventory === false ||
      variant.allow_backorder === true ||
      (variant.inventory_quantity ?? 0) > 0,
  );
}

function compareByTitle(left: StoreProduct, right: StoreProduct): number {
  return left.title.localeCompare(right.title, "en-US", { sensitivity: "base" });
}

function compareByCreatedAt(left: StoreProduct, right: StoreProduct): number {
  const leftDate = left.created_at ? Date.parse(left.created_at) : 0;
  const rightDate = right.created_at ? Date.parse(right.created_at) : 0;

  return rightDate - leftDate;
}

function compareByPrice(
  left: StoreProduct,
  right: StoreProduct,
  direction: "asc" | "desc",
): number {
  const leftPrice = getProductPrice(left);
  const rightPrice = getProductPrice(right);

  if (leftPrice === null && rightPrice === null) {
    return compareByTitle(left, right);
  }

  if (leftPrice === null) {
    return 1;
  }

  if (rightPrice === null) {
    return -1;
  }

  return direction === "asc" ? leftPrice - rightPrice : rightPrice - leftPrice;
}

function sortProducts(products: StoreProduct[], sort: ProductSort): StoreProduct[] {
  const sortedProducts = [...products];

  if (sort === "alpha_asc") {
    return sortedProducts.sort(compareByTitle);
  }

  if (sort === "price_asc") {
    return sortedProducts.sort((left, right) => compareByPrice(left, right, "asc"));
  }

  if (sort === "price_desc") {
    return sortedProducts.sort((left, right) => compareByPrice(left, right, "desc"));
  }

  return sortedProducts.sort(compareByCreatedAt);
}

function filterProductsByAvailabilityAndPrice(
  products: StoreProduct[],
  inStockOnly: boolean,
  priceMin: number,
  priceMax: number,
): StoreProduct[] {
  return products.filter((product) => {
    if (inStockOnly && !isProductAvailable(product)) {
      return false;
    }

    const price = getProductPrice(product);

    if (price === null) {
      return priceMin === 0 && priceMax >= PRODUCT_PRICE_MAX_CENTS;
    }

    return price >= priceMin && price <= priceMax;
  });
}

async function fetchProductCategories(): Promise<StoreProductCategory[]> {
  const { product_categories: productCategories } = await getMedusaClient().store.category.list({
    fields: "id,name,handle,rank,parent_category_id",
    limit: 100,
    order: "rank",
  });

  return productCategories;
}

const getCachedProductCategories = unstable_cache(
  fetchProductCategories,
  ["medusa-product-categories"],
  {
    revalidate: 60 * 60,
    tags: ["product-categories"],
  },
);

async function fetchProductCollections(): Promise<StoreCollection[]> {
  const { collections } = await getMedusaClient().store.collection.list({
    fields: "id,title,handle",
    limit: 100,
    order: "title",
  });

  return collections;
}

const getCachedProductCollections = unstable_cache(
  fetchProductCollections,
  ["medusa-product-collections"],
  {
    revalidate: 60 * 60,
    tags: ["product-collections"],
  },
);

async function resolveCategoryIds(handles: readonly string[]): Promise<string[]> {
  if (handles.length === 0) {
    return [];
  }

  const categories = await getCachedProductCategories();
  const idsByHandle = new Map(categories.map((category) => [category.handle, category.id]));

  return handles.flatMap((handle) => {
    const id = idsByHandle.get(handle);

    return id ? [id] : [];
  });
}

async function resolveCollectionIds(handles: readonly string[]): Promise<string[]> {
  if (handles.length === 0) {
    return [];
  }

  const collections = await getCachedProductCollections();
  const idsByHandle = new Map(collections.map((collection) => [collection.handle, collection.id]));

  return handles.flatMap((handle) => {
    const id = idsByHandle.get(handle);

    return id ? [id] : [];
  });
}

async function fetchProductList(
  regionId: string,
  q: string,
  categoryHandles: string[],
  collectionHandles: string[],
  limit: number,
  offset: number,
  sort: ProductSort,
  inStockOnly: boolean,
  priceMin: number,
  priceMax: number,
): Promise<ProductListResult> {
  const normalizedCategoryHandles = normalizeStrings(categoryHandles);
  const normalizedCollectionHandles = normalizeStrings(collectionHandles);
  const [categoryIds, collectionIds] = await Promise.all([
    resolveCategoryIds(normalizedCategoryHandles),
    resolveCollectionIds(normalizedCollectionHandles),
  ]);

  if (normalizedCategoryHandles.length > 0 && categoryIds.length === 0) {
    return { count: 0, hasMore: false, products: [] };
  }

  if (normalizedCollectionHandles.length > 0 && collectionIds.length === 0) {
    return { count: 0, hasMore: false, products: [] };
  }

  const needsPostProcessing =
    inStockOnly || priceMin > 0 || priceMax < PRODUCT_PRICE_MAX_CENTS || sort.startsWith("price_");
  const queryLimit = needsPostProcessing
    ? Math.min(MAX_POST_FILTER_PRODUCTS, Math.max(limit + offset, limit))
    : limit;
  const query: ProductListQuery = {
    fields: PRODUCT_LIST_FIELDS,
    limit: queryLimit,
    offset: needsPostProcessing ? 0 : offset,
    region_id: regionId,
  };
  const trimmedQuery = q.trim();
  const nativeOrder = getNativeOrder(sort);

  if (trimmedQuery) {
    query.q = trimmedQuery;
  }

  if (categoryIds.length > 0) {
    query.category_id = categoryIds;
  }

  if (collectionIds.length > 0) {
    query.collection_id = collectionIds;
  }

  if (nativeOrder) {
    query.order = nativeOrder;
  }

  const { count, products } = await getMedusaClient().store.product.list(query);

  if (!needsPostProcessing) {
    return {
      count,
      hasMore: offset + products.length < count,
      products,
    };
  }

  const filteredProducts = sortProducts(
    filterProductsByAvailabilityAndPrice(products, inStockOnly, priceMin, priceMax),
    sort,
  );
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);

  return {
    count: filteredProducts.length,
    hasMore: offset + paginatedProducts.length < filteredProducts.length,
    products: paginatedProducts,
  };
}

const getCachedProductList = unstable_cache(fetchProductList, ["medusa-products-list"], {
  revalidate: 60,
  tags: ["products"],
});

export async function listProducts(input: ListProductsInput): Promise<ProductListResult> {
  const sort = input.sort ?? "newest";
  const priceMin = Math.max(0, input.priceMin ?? 0);
  const priceMax = Math.min(
    PRODUCT_PRICE_MAX_CENTS,
    Math.max(input.priceMax ?? PRODUCT_PRICE_MAX_CENTS, priceMin),
  );

  return getCachedProductList(
    input.regionId,
    input.q?.trim() ?? "",
    normalizeStrings(input.categoryHandles),
    normalizeStrings(input.collectionHandles),
    normalizeLimit(input.limit),
    normalizeOffset(input.offset),
    sort,
    input.inStockOnly ?? false,
    priceMin,
    priceMax,
  );
}

export async function listProductCategories(): Promise<StoreProductCategory[]> {
  return getCachedProductCategories();
}

async function fetchProductByHandle(handle: string): Promise<StoreProduct | null> {
  const normalizedHandle = handle.trim();

  if (!normalizedHandle) {
    return null;
  }

  const region = await getDefaultRegion();
  const { products } = await getMedusaClient().store.product.list({
    fields: PRODUCT_DETAIL_FIELDS,
    handle: normalizedHandle,
    limit: 1,
    region_id: region.id,
  });

  return products[0] ?? null;
}

const getCachedProductByHandle = unstable_cache(
  fetchProductByHandle,
  ["medusa-product-by-handle"],
  {
    revalidate: 60,
    tags: ["product", "products"],
  },
);

export async function getProductByHandle(handle: string): Promise<StoreProduct | null> {
  return getCachedProductByHandle(handle);
}
