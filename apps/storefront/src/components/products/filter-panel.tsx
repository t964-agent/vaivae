"use client";

import type { CheckedState } from "@radix-ui/react-checkbox";

import {
  Button,
  Checkbox,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  Label,
  Separator,
  Stack,
} from "@/components/ui";
import {
  PRODUCT_PRICE_MAX_CENTS,
  PRODUCT_SORT_OPTIONS,
  type ProductSort,
  type ProductsFilters,
} from "@/lib/url-state/products-filters";
import {
  debounceProductsFilters,
  useProductsFilters,
} from "@/lib/url-state/products-filters-client";
import type { StoreProductCategory } from "@/medusa/types";

const SORT_LABELS: Record<ProductSort, string> = {
  alpha_asc: "A to Z",
  newest: "Newest",
  price_asc: "Price low",
  price_desc: "Price high",
};

type ProductsFilterPanelProps = {
  categories: StoreProductCategory[];
  resultCount: number;
};

function centsToDollars(cents: number): string {
  if (cents <= 0 || cents >= PRODUCT_PRICE_MAX_CENTS) {
    return "";
  }

  return String(Math.round(cents / 100));
}

function dollarsToCents(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const dollars = Number(trimmed);

  if (!Number.isFinite(dollars) || dollars < 0) {
    return null;
  }

  return Math.round(dollars * 100);
}

function getActiveFilterCount(filters: ProductsFilters): number {
  return (
    (filters.q ? 1 : 0) +
    filters.categories.length +
    (filters.inStock ? 1 : 0) +
    (filters.priceMin > 0 || filters.priceMax < PRODUCT_PRICE_MAX_CENTS ? 1 : 0)
  );
}

function formatResultCount(count: number): string {
  return count === 1 ? "1 piece" : `${count} pieces`;
}

function ProductsFilterControls({
  categories,
  filters,
  idPrefix,
  resultCount,
  setFilters,
}: ProductsFilterPanelProps & {
  filters: ProductsFilters;
  idPrefix: string;
  setFilters: ReturnType<typeof useProductsFilters>["setFilters"];
}) {
  const hasFilters = getActiveFilterCount(filters) > 0 || filters.sort !== "newest";

  function toggleCategory(handle: string, checked: CheckedState): void {
    void setFilters((currentFilters) => {
      const nextCategories =
        checked === true
          ? Array.from(new Set([...currentFilters.categories, handle])).sort()
          : currentFilters.categories.filter((category) => category !== handle);

      return { categories: nextCategories, page: 1 };
    });
  }

  function clearFilters(): void {
    void setFilters({
      categories: [],
      colors: [],
      inStock: false,
      materials: [],
      page: 1,
      priceMax: PRODUCT_PRICE_MAX_CENTS,
      priceMin: 0,
      q: "",
      sort: "newest",
    });
  }

  return (
    <Stack gap={8}>
      <fieldset className="grid gap-3">
        <Label asChild>
          <legend className="text-xs tracking-[0.24em] text-on-light/55 uppercase">Search</legend>
        </Label>
        <Input
          key={`search-${filters.q}`}
          aria-label="Search products"
          defaultValue={filters.q}
          onChange={(event) => {
            void setFilters(
              { page: 1, q: event.currentTarget.value },
              { limitUrlUpdates: debounceProductsFilters() },
            );
          }}
          placeholder="Silk, dress, jacket"
          type="search"
        />
      </fieldset>

      <Separator />

      <fieldset className="grid gap-4">
        <legend className="text-xs tracking-[0.24em] text-on-light/55 uppercase">Categories</legend>
        <Stack gap={3}>
          {categories.length > 0 ? (
            categories.map((category) => {
              const checkboxId = `${idPrefix}-category-${category.id}`;
              const checked = filters.categories.includes(category.handle);

              return (
                <div key={category.id} className="flex items-center gap-3">
                  <Checkbox
                    checked={checked}
                    id={checkboxId}
                    onCheckedChange={(nextChecked) => {
                      toggleCategory(category.handle, nextChecked);
                    }}
                  />
                  <Label className="cursor-pointer text-sm text-on-light/75" htmlFor={checkboxId}>
                    {category.name}
                  </Label>
                </div>
              );
            })
          ) : (
            <p className="text-sm leading-6 text-on-light/55">Categories are being prepared.</p>
          )}
        </Stack>
      </fieldset>

      <Separator />

      <fieldset className="grid gap-4">
        <legend className="text-xs tracking-[0.24em] text-on-light/55 uppercase">
          Availability
        </legend>
        <div className="flex items-center gap-3">
          <Checkbox
            checked={filters.inStock}
            id={`${idPrefix}-in-stock`}
            onCheckedChange={(checked) => {
              void setFilters({ inStock: checked === true, page: 1 });
            }}
          />
          <Label
            className="cursor-pointer text-sm text-on-light/75"
            htmlFor={`${idPrefix}-in-stock`}
          >
            In stock only
          </Label>
        </div>
      </fieldset>

      <Separator />

      <fieldset className="grid gap-4">
        <legend className="text-xs tracking-[0.24em] text-on-light/55 uppercase">Price</legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label className="text-xs text-on-light/55" htmlFor={`${idPrefix}-price-min`}>
              Min USD
            </Label>
            <Input
              key={`price-min-${filters.priceMin}`}
              defaultValue={centsToDollars(filters.priceMin)}
              id={`${idPrefix}-price-min`}
              inputMode="numeric"
              min={0}
              onChange={(event) => {
                void setFilters(
                  { page: 1, priceMin: dollarsToCents(event.currentTarget.value) ?? 0 },
                  { limitUrlUpdates: debounceProductsFilters() },
                );
              }}
              placeholder="0"
              type="number"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-xs text-on-light/55" htmlFor={`${idPrefix}-price-max`}>
              Max USD
            </Label>
            <Input
              key={`price-max-${filters.priceMax}`}
              defaultValue={centsToDollars(filters.priceMax)}
              id={`${idPrefix}-price-max`}
              inputMode="numeric"
              min={0}
              onChange={(event) => {
                void setFilters(
                  {
                    page: 1,
                    priceMax: dollarsToCents(event.currentTarget.value) ?? PRODUCT_PRICE_MAX_CENTS,
                  },
                  { limitUrlUpdates: debounceProductsFilters() },
                );
              }}
              placeholder="Any"
              type="number"
            />
          </div>
        </div>
      </fieldset>

      <Separator />

      <fieldset className="grid gap-4">
        <legend className="text-xs tracking-[0.24em] text-on-light/55 uppercase">Sort</legend>
        <div className="grid gap-2">
          {PRODUCT_SORT_OPTIONS.map((sort) => (
            <label
              key={sort}
              className="flex cursor-pointer items-center justify-between border border-on-light/10 px-3 py-2 text-sm text-on-light/75 transition-colors hover:border-on-light/25"
            >
              <span>{SORT_LABELS[sort]}</span>
              <input
                checked={filters.sort === sort}
                className="accent-oxblood"
                name={`${idPrefix}-sort`}
                onChange={() => {
                  void setFilters({ page: 1, sort });
                }}
                type="radio"
                value={sort}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <Button disabled={!hasFilters} onClick={clearFilters} type="button" variant="ghost">
        Clear filters
      </Button>

      <p aria-atomic="true" className="sr-only" role="status">
        {formatResultCount(resultCount)} shown.
      </p>
    </Stack>
  );
}

export function ProductsFilterPanel({ categories, resultCount }: ProductsFilterPanelProps) {
  const { filters, isPending, setFilters } = useProductsFilters();
  const activeFilterCount = getActiveFilterCount(filters);
  const triggerLabel = activeFilterCount > 0 ? `Filter (${activeFilterCount})` : "Filter";

  return (
    <>
      <div className="flex items-center justify-between gap-4 lg:hidden">
        <p className="text-sm text-on-light/55" id="products-mobile-result-count">
          {formatResultCount(resultCount)} shown
        </p>
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              aria-describedby="products-mobile-result-count"
              size="sm"
              type="button"
              variant="ghost"
            >
              {triggerLabel}
            </Button>
          </DrawerTrigger>
          <DrawerContent side="left">
            <DrawerHeader>
              <DrawerTitle>Refine the edit</DrawerTitle>
              <DrawerDescription>
                Adjust the collection view. Changes are reflected in the address bar for sharing.
              </DrawerDescription>
            </DrawerHeader>
            <div aria-busy={isPending} className="mt-8">
              <ProductsFilterControls
                categories={categories}
                filters={filters}
                idPrefix="mobile-products"
                resultCount={resultCount}
                setFilters={setFilters}
              />
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button type="button">Show {formatResultCount(resultCount)}</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      <aside aria-label="Product filters" className="hidden lg:block">
        <div aria-busy={isPending} className="sticky top-28">
          <ProductsFilterControls
            categories={categories}
            filters={filters}
            idPrefix="desktop-products"
            resultCount={resultCount}
            setFilters={setFilters}
          />
        </div>
      </aside>
    </>
  );
}
