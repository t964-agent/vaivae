"use client";

import { useTransition } from "react";
import { debounce, type SetValues, useQueryStates } from "nuqs";

import {
  normalizeProductsFilters,
  productsFiltersSearchParams,
  type ProductsFilters,
} from "./products-filters";

export const PRODUCTS_FILTERS_DEBOUNCE_MS = 300;

export function useProductsFilters(): {
  filters: ProductsFilters;
  isPending: boolean;
  setFilters: SetValues<typeof productsFiltersSearchParams>;
} {
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useQueryStates(productsFiltersSearchParams, {
    history: "replace",
    scroll: false,
    shallow: false,
    startTransition,
  });

  return {
    filters: normalizeProductsFilters(filters),
    isPending,
    setFilters,
  };
}

export function debounceProductsFilters() {
  return debounce(PRODUCTS_FILTERS_DEBOUNCE_MS);
}
