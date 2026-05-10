import { describe, expect, it } from "vitest";

import {
  PRODUCT_PRICE_MAX_CENTS,
  hasActiveProductsFilters,
  loadProductsFiltersSearchParams,
  normalizeProductsFilters,
  serializeProductsFilters,
} from "./products-filters";

describe("products filter URL state", () => {
  it("parses, normalizes, and serializes the product filter contract", async () => {
    // Arrange
    const rawSearchParams = {
      categories: ["ready-to-wear", "ready-to-wear", ""],
      colors: ["ivory"],
      inStock: "true",
      materials: [" silk ", ""],
      page: "0",
      priceMax: "0",
      priceMin: "-500",
      q: "  slip dress  ",
      sort: "price_desc",
    };

    // Act
    const loaded = await loadProductsFiltersSearchParams(rawSearchParams);
    const filters = normalizeProductsFilters(loaded);
    const serialized = serializeProductsFilters("https://vaivae.test/products", filters);
    const url = new URL(serialized);

    // Assert
    expect(filters).toEqual({
      categories: ["ready-to-wear"],
      colors: ["ivory"],
      inStock: true,
      materials: ["silk"],
      page: 1,
      priceMax: PRODUCT_PRICE_MAX_CENTS,
      priceMin: 0,
      q: "slip dress",
      sort: "price_desc",
    });
    expect(url.pathname).toBe("/products");
    expect(url.searchParams.get("q")).toBe("slip dress");
    expect(url.searchParams.get("sort")).toBe("price_desc");
    expect(url.searchParams.get("inStock")).toBe("true");
    expect(url.searchParams.has("page")).toBe(false);
    expect(url.searchParams.has("priceMin")).toBe(false);
    expect(url.searchParams.has("priceMax")).toBe(false);
  });

  it("detects the default filter state as inactive", async () => {
    // Arrange
    const loaded = await loadProductsFiltersSearchParams({});

    // Act
    const filters = normalizeProductsFilters(loaded);

    // Assert
    expect(hasActiveProductsFilters(filters)).toBe(false);
  });
});
