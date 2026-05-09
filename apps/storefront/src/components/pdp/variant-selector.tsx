"use client";

import { useMemo, useState } from "react";

import { Button, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { StoreProductOption, StoreProductVariant } from "@/medusa/types";
import type { ProductByHandleQueryResult } from "@/sanity/types";

type EditorialProduct = NonNullable<ProductByHandleQueryResult>;
type ProductColorSwatch = NonNullable<EditorialProduct["colorSwatches"]>[number];

export type VariantSelectorProps = {
  colorSwatches?: ProductColorSwatch[] | null | undefined;
  initialVariantId?: string | undefined;
  onVariantChange: (variantId: string) => void;
  options: StoreProductOption[] | null | undefined;
  variants: StoreProductVariant[] | null | undefined;
};

type OptionValue = {
  id: string | null;
  value: string;
};

type SelectedValues = Record<string, string>;

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isVariantPurchasable(variant: StoreProductVariant): boolean {
  return (
    variant.manage_inventory === false ||
    variant.allow_backorder === true ||
    (variant.inventory_quantity ?? 0) > 0
  );
}

function getVariantOptionValue(
  variant: StoreProductVariant,
  option: StoreProductOption,
): StoreProductVariant["options"] extends Array<infer TValue> | null ? TValue | null : never {
  const values = variant.options ?? [];
  const optionTitle = normalize(option.title);
  const value = values.find(
    (candidate) =>
      candidate.option_id === option.id ||
      candidate.option?.id === option.id ||
      normalize(candidate.option?.title) === optionTitle,
  );

  return value ?? null;
}

function getOptionValues(
  option: StoreProductOption,
  variants: StoreProductVariant[],
): OptionValue[] {
  const values = new Map<string, OptionValue>();

  for (const value of option.values ?? []) {
    const normalized = normalize(value.value);

    if (normalized) {
      values.set(normalized, { id: value.id, value: value.value });
    }
  }

  for (const variant of variants) {
    const value = getVariantOptionValue(variant, option);
    const normalized = normalize(value?.value);

    if (normalized && !values.has(normalized)) {
      values.set(normalized, { id: value?.id ?? null, value: value?.value ?? "" });
    }
  }

  return [...values.values()].filter((value) => value.value.trim().length > 0);
}

function getSelectedValues(
  variant: StoreProductVariant | null | undefined,
  options: StoreProductOption[],
): SelectedValues {
  const selectedValues: SelectedValues = {};

  if (!variant) {
    return selectedValues;
  }

  for (const option of options) {
    const value = getVariantOptionValue(variant, option)?.value?.trim();

    if (value) {
      selectedValues[option.id] = value;
    }
  }

  return selectedValues;
}

function variantMatchesSelection(
  variant: StoreProductVariant,
  options: StoreProductOption[],
  selectedValues: SelectedValues,
): boolean {
  return options.every((option) => {
    const selectedValue = selectedValues[option.id]?.trim();

    if (!selectedValue) {
      return true;
    }

    return normalize(getVariantOptionValue(variant, option)?.value) === normalize(selectedValue);
  });
}

function findMatchingVariant(
  variants: StoreProductVariant[],
  options: StoreProductOption[],
  selectedValues: SelectedValues,
): StoreProductVariant | null {
  const hasEveryOption = options.every((option) => selectedValues[option.id]?.trim());

  if (!hasEveryOption) {
    return null;
  }

  return (
    variants.find((variant) => variantMatchesSelection(variant, options, selectedValues)) ?? null
  );
}

function isOptionValueUnavailable(
  option: StoreProductOption,
  value: OptionValue,
  options: StoreProductOption[],
  variants: StoreProductVariant[],
  selectedValues: SelectedValues,
): boolean {
  const nextSelectedValues = { ...selectedValues, [option.id]: value.value };

  return !variants.some(
    (variant) =>
      isVariantPurchasable(variant) &&
      variantMatchesSelection(variant, options, nextSelectedValues),
  );
}

function getColorSwatch(
  optionValue: OptionValue,
  colorSwatches: ProductColorSwatch[] | null | undefined,
): ProductColorSwatch | null {
  const swatches = colorSwatches ?? [];

  return (
    swatches.find((item) => optionValue.id && item.medusaVariantOptionValueId === optionValue.id) ??
    swatches.find((item) => normalize(item.swatch?.name) === normalize(optionValue.value)) ??
    null
  );
}

function isColorOption(option: StoreProductOption): boolean {
  return normalize(option.title) === "color";
}

export function VariantSelector({
  colorSwatches,
  initialVariantId,
  onVariantChange,
  options,
  variants,
}: VariantSelectorProps) {
  const productOptions = useMemo(
    () => (options ?? []).filter((option) => option.id && option.title),
    [options],
  );
  const productVariants = useMemo(() => variants ?? [], [variants]);
  const initialVariant = useMemo(
    () =>
      productVariants.find((variant) => variant.id === initialVariantId) ??
      productVariants[0] ??
      null,
    [initialVariantId, productVariants],
  );
  const [selectedValues, setSelectedValues] = useState<SelectedValues>(() =>
    getSelectedValues(initialVariant, productOptions),
  );

  if (productOptions.length === 0 || productVariants.length === 0) {
    return null;
  }

  return (
    <Stack gap={6}>
      {productOptions.map((option) => {
        const values = getOptionValues(option, productVariants);

        if (values.length === 0) {
          return null;
        }

        return (
          <fieldset className="grid gap-3" key={option.id}>
            <legend className="font-body text-xs font-medium tracking-[0.18em] text-on-light/55 uppercase">
              {option.title}
            </legend>
            <div aria-label={option.title} className="flex flex-wrap gap-2" role="radiogroup">
              {values.map((value) => {
                const selected = normalize(selectedValues[option.id]) === normalize(value.value);
                const unavailable = isOptionValueUnavailable(
                  option,
                  value,
                  productOptions,
                  productVariants,
                  selectedValues,
                );
                const swatch = isColorOption(option) ? getColorSwatch(value, colorSwatches) : null;
                const swatchHex = swatch?.swatch?.hex?.trim();
                const label = `${option.title}: ${value.value}${unavailable ? ", unavailable" : ""}`;

                return (
                  <Button
                    aria-checked={selected}
                    aria-label={label}
                    className={cn(
                      "min-w-11 rounded-full border-on-light/20 px-4 text-xs tracking-[0.12em] uppercase",
                      selected && "border-accent-red bg-on-light text-on-dark hover:bg-on-light",
                      unavailable && "line-through opacity-40",
                      swatch && "min-w-0 px-2",
                    )}
                    disabled={unavailable}
                    key={`${option.id}-${value.value}`}
                    onClick={() => {
                      const nextSelectedValues = { ...selectedValues, [option.id]: value.value };
                      const matchingVariant = findMatchingVariant(
                        productVariants,
                        productOptions,
                        nextSelectedValues,
                      );

                      setSelectedValues(nextSelectedValues);
                      onVariantChange(matchingVariant?.id ?? "");
                    }}
                    role="radio"
                    type="button"
                    variant="ghost"
                  >
                    {swatch ? (
                      <span
                        aria-hidden
                        className="size-6 rounded-full border border-on-light/20"
                        style={swatchHex ? { backgroundColor: swatchHex } : undefined}
                      />
                    ) : null}
                    <span className={cn(swatch && "sr-only")}>{value.value}</span>
                  </Button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </Stack>
  );
}
