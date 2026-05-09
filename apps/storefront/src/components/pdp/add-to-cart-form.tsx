"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useCartUiStore } from "@/components/providers/cart-ui-provider";
import { WishlistToggleButton } from "@/components/account/wishlist-toggle-button";
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  HStack,
  Input,
  Stack,
} from "@/components/ui";
import { dispatchCartUpdated } from "@/lib/cart-events";
import { track } from "@/lib/analytics/track";
import { addLineItemAction } from "@/medusa/actions";
import type { StoreProduct, StoreProductVariant } from "@/medusa/types";
import { toast } from "@/lib/toast";
import type { ProductByHandleQueryResult } from "@/sanity/types";

import { VariantSelector } from "./variant-selector";

type EditorialProduct = NonNullable<ProductByHandleQueryResult>;

const addToCartFormSchema = z.object({
  quantity: z.number().int().min(1).max(5),
  variantId: z.string().trim().min(1, "Select a size and color."),
});

type AddToCartFormValues = z.infer<typeof addToCartFormSchema>;

export type AddToCartFormProps = {
  colorSwatches?: EditorialProduct["colorSwatches"] | null | undefined;
  isAuthenticated?: boolean | undefined;
  product: StoreProduct;
  wishlistItems?: PdpWishlistItem[] | undefined;
};

export type PdpWishlistItem = {
  itemId: string;
  variantId: string;
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

function getFirstSelectableVariant(variants: StoreProductVariant[]): StoreProductVariant | null {
  return variants.find(isVariantPurchasable) ?? variants[0] ?? null;
}

function formatPrice(variant: StoreProductVariant | null | undefined): string {
  const amount = variant?.calculated_price?.calculated_amount;
  const currencyCode = variant?.calculated_price?.currency_code;

  if (typeof amount !== "number" || !currencyCode?.trim()) {
    return "Available soon";
  }

  return new Intl.NumberFormat("en-US", {
    currency: currencyCode.toUpperCase(),
    style: "currency",
  }).format(amount / 100);
}

function getAnalyticsPrice(variant: StoreProductVariant | null | undefined): number {
  const amount = variant?.calculated_price?.calculated_amount;

  return typeof amount === "number" ? amount / 100 : 0;
}

function getAnalyticsCurrency(variant: StoreProductVariant | null | undefined): string {
  return (variant?.calculated_price?.currency_code?.trim() || "usd").toUpperCase();
}

function getMaxQuantity(variant: StoreProductVariant | null | undefined): number {
  if (!variant || variant.manage_inventory === false || variant.allow_backorder === true) {
    return 5;
  }

  return Math.min(5, Math.max(1, variant.inventory_quantity ?? 1));
}

function getAvailabilityNote(variant: StoreProductVariant | null | undefined): string {
  if (!variant) {
    return "Select every option to see availability.";
  }

  if (!isVariantPurchasable(variant)) {
    return "This option is out of stock.";
  }

  if (variant.manage_inventory === false || variant.allow_backorder === true) {
    return "Ships in 3-5 business days.";
  }

  const quantity = variant.inventory_quantity ?? 0;

  if (quantity > 0 && quantity <= 2) {
    return `Only ${quantity} available. Ships in 3-5 business days.`;
  }

  return "Ships in 3-5 business days.";
}

export function AddToCartForm({
  colorSwatches,
  isAuthenticated = false,
  product,
  wishlistItems = [],
}: AddToCartFormProps) {
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const initialVariant = useMemo(() => getFirstSelectableVariant(variants), [variants]);
  const [isPending, startTransition] = useTransition();
  const markAdded = useCartUiStore((store) => store.markAdded);
  const openCart = useCartUiStore((store) => store.open);
  const form = useForm<AddToCartFormValues>({
    defaultValues: {
      quantity: 1,
      variantId: initialVariant?.id ?? "",
    },
    mode: "onChange",
    resolver: zodResolver(addToCartFormSchema),
  });
  const variantId = useWatch({ control: form.control, name: "variantId" });
  const quantity = useWatch({ control: form.control, name: "quantity" }) ?? 1;
  const selectedVariant = variants.find((variant) => variant.id === variantId) ?? null;
  const selectedVariantAvailable = isVariantPurchasable(selectedVariant);
  const selectedWishlistItem = selectedVariant
    ? wishlistItems.find((item) => item.variantId === selectedVariant.id)
    : null;
  const maxQuantity = getMaxQuantity(selectedVariant);
  const availabilityNote = getAvailabilityNote(selectedVariant);
  const price = formatPrice(selectedVariant);

  useEffect(() => {
    if (quantity > maxQuantity) {
      form.setValue("quantity", maxQuantity, { shouldDirty: true, shouldValidate: true });
    }
  }, [form, maxQuantity, quantity]);

  const onSubmit = form.handleSubmit((values) => {
    if (!selectedVariantAvailable || isPending) {
      return;
    }

    startTransition(() => {
      void addLineItemAction({ quantity: values.quantity, variantId: values.variantId }).then(
        (result) => {
          if (result.ok) {
            track({
              name: "add_to_cart",
              props: {
                currency: getAnalyticsCurrency(selectedVariant),
                price: getAnalyticsPrice(selectedVariant),
                quantity: values.quantity,
                variantId: values.variantId,
              },
            });
            dispatchCartUpdated(result.cart);
            markAdded(values.variantId);
            openCart();
            toast.success("Added to bag");
            return;
          }

          toast.error(result.error || "Could not add to bag");
        },
      );
    });
  });

  return (
    <Form {...form}>
      <form className="grid gap-8" noValidate onSubmit={onSubmit}>
        <Stack gap={3}>
          <div className="flex items-baseline justify-between gap-4 border-y border-on-light/10 py-4">
            <span className="font-body text-xs tracking-[0.18em] text-on-light/55 uppercase">
              Price
            </span>
            <span aria-label={`Selected price: ${price}`} className="text-sm text-on-light">
              {price}
            </span>
          </div>
          <p aria-live="polite" className="text-sm leading-6 text-on-light/60">
            {availabilityNote}
          </p>
        </Stack>

        <FormField
          control={form.control}
          name="variantId"
          render={({ field }) => (
            <FormItem>
              <VariantSelector
                colorSwatches={colorSwatches}
                initialVariantId={initialVariant?.id}
                onVariantChange={(nextVariantId) => {
                  field.onChange(nextVariantId);
                }}
                options={product.options}
                variants={variants}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <HStack gap={2}>
                <Button
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => {
                    const nextQuantity = Math.max(1, quantity - 1);

                    field.onChange(nextQuantity);
                  }}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  -
                </Button>
                <FormControl>
                  <Input
                    aria-label="Quantity"
                    className="w-16 text-center"
                    inputMode="numeric"
                    max={maxQuantity}
                    min={1}
                    readOnly
                    type="number"
                    value={field.value}
                  />
                </FormControl>
                <Button
                  aria-label="Increase quantity"
                  disabled={quantity >= maxQuantity}
                  onClick={() => {
                    const nextQuantity = Math.min(maxQuantity, quantity + 1);

                    field.onChange(nextQuantity);
                  }}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  +
                </Button>
              </HStack>
              <FormMessage />
            </FormItem>
          )}
        />

        <Stack gap={3}>
          {selectedVariantAvailable ? (
            <Button
              aria-label="Add selected product to bag"
              className="w-full"
              disabled={!selectedVariant}
              loading={isPending}
              size="lg"
              type="submit"
            >
              Add to bag
            </Button>
          ) : (
            <Button asChild className="w-full" size="lg" variant="ghost">
              <Link href={"/#newsletter" as Route}>Notify me</Link>
            </Button>
          )}
          <WishlistToggleButton
            initialIsInWishlist={Boolean(selectedWishlistItem)}
            initialWishlistItemId={selectedWishlistItem?.itemId ?? null}
            isAuthenticated={isAuthenticated}
            key={selectedVariant?.id ?? "wishlist-unselected"}
            variantId={selectedVariant?.id ?? null}
          />
        </Stack>
      </form>
    </Form>
  );
}
