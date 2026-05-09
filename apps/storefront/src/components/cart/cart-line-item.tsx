"use client";

import { Minus, Plus, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { startTransition, useOptimistic, useTransition } from "react";

import { Button, Spinner, VisuallyHidden } from "@/components/ui";
import { dispatchCartUpdated } from "@/lib/cart-events";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { removeLineItemAction, updateLineItemAction } from "@/medusa/actions";
import type { StoreCart, StoreCartLineItem } from "@/medusa/types";
import { toast } from "@/lib/toast";

const MAX_LINE_QUANTITY = 10;

type CartLineItemProps = {
  currencyCode: string;
  item: StoreCartLineItem;
  onCartChange: (cart: StoreCart | null) => void;
  onOptimisticRemove: (lineItemId: string) => void;
  onStatus: (message: string) => void;
};

function getTrimmedValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function getProductTitle(item: StoreCartLineItem): string {
  return getTrimmedValue(item.product_title) ?? getTrimmedValue(item.title) ?? "Untitled piece";
}

function getVariantDetails(item: StoreCartLineItem): string | null {
  const optionLabels =
    item.variant?.options
      ?.map((optionValue) => {
        const value = getTrimmedValue(optionValue.value);

        if (!value) {
          return null;
        }

        const optionTitle = getTrimmedValue(optionValue.option?.title);

        if (!optionTitle || optionTitle.toLowerCase() === "title") {
          return value;
        }

        return `${optionTitle}: ${value}`;
      })
      .filter((label): label is string => Boolean(label)) ?? [];

  if (optionLabels.length > 0) {
    return optionLabels.join(" / ");
  }

  return (
    getTrimmedValue(item.variant_title) ??
    getTrimmedValue(item.variant?.title) ??
    getTrimmedValue(item.subtitle)
  );
}

function getThumbnailUrl(item: StoreCartLineItem): string | null {
  return (
    getTrimmedValue(item.thumbnail) ??
    getTrimmedValue(item.variant?.thumbnail) ??
    getTrimmedValue(item.product?.thumbnail) ??
    getTrimmedValue(item.variant?.images?.[0]?.url) ??
    getTrimmedValue(item.product?.images?.[0]?.url)
  );
}

function getLineAmount(item: StoreCartLineItem): number {
  return item.total ?? item.subtotal ?? item.unit_price;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Could not update your bag.";
}

export function CartLineItem({
  currencyCode,
  item,
  onCartChange,
  onOptimisticRemove,
  onStatus,
}: CartLineItemProps) {
  const [isPending, runTransition] = useTransition();
  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(
    item.quantity,
    (_currentQuantity, nextQuantity: number) => nextQuantity,
  );
  const title = getProductTitle(item);
  const variantDetails = getVariantDetails(item);
  const thumbnailUrl = getThumbnailUrl(item);
  const handle = getTrimmedValue(item.product_handle) ?? getTrimmedValue(item.product?.handle);
  const productHref = handle ? (`/products/${handle}` as Route) : null;
  const imageStyle = thumbnailUrl
    ? { backgroundImage: `url(${JSON.stringify(thumbnailUrl)})` }
    : undefined;
  const lineAmount = getLineAmount(item);
  const canIncrement = optimisticQuantity < MAX_LINE_QUANTITY && !isPending;
  const canDecrement = optimisticQuantity > 1 && !isPending;

  function commitCart(nextCart: StoreCart | null): void {
    startTransition(() => {
      onCartChange(nextCart);
    });
    dispatchCartUpdated(nextCart);
  }

  function updateQuantity(nextQuantity: number): void {
    if (nextQuantity < 1 || nextQuantity > MAX_LINE_QUANTITY || isPending) {
      return;
    }

    runTransition(async () => {
      setOptimisticQuantity(nextQuantity);

      try {
        const result = await updateLineItemAction({ lineItemId: item.id, quantity: nextQuantity });

        if (result.ok) {
          commitCart(result.cart);
          onStatus(`Updated ${title} quantity to ${nextQuantity}.`);
          return;
        }

        toast.error(result.error || "Could not update quantity.");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  function removeItem(): void {
    if (isPending) {
      return;
    }

    runTransition(async () => {
      onOptimisticRemove(item.id);

      try {
        const result = await removeLineItemAction({ lineItemId: item.id });

        if (result.ok) {
          commitCart(result.cart);
          onStatus(`Removed ${title} from your bag.`);
          return;
        }

        toast.error(result.error || "Could not remove item.");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  const titleContent = productHref ? (
    <Link
      className="underline-offset-4 transition-colors hover:text-oxblood hover:underline focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
      href={productHref}
    >
      {title}
    </Link>
  ) : (
    title
  );

  return (
    <li className="grid grid-cols-[5rem_1fr] gap-4 border-b border-on-light/10 py-5">
      <div className="size-20 overflow-hidden bg-on-light/5">
        {thumbnailUrl ? (
          <div
            aria-label={`${title} image`}
            className="size-full bg-cover bg-center"
            role="img"
            style={imageStyle}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[0.6rem] tracking-[0.18em] text-on-light/35 uppercase">
            Image pending
          </div>
        )}
      </div>

      <div className="grid min-w-0 gap-4">
        <div className="grid gap-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg leading-tight font-light tracking-[-0.03em] text-on-light italic">
              {titleContent}
            </h3>
            <p className="shrink-0 text-sm text-on-light/75 tabular-nums">
              {formatPrice(lineAmount, currencyCode)}
            </p>
          </div>
          {variantDetails ? (
            <p className="text-xs leading-5 text-on-light/55">{variantDetails}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1" aria-label={`Quantity for ${title}`}>
            <VisuallyHidden>Quantity</VisuallyHidden>
            <Button
              aria-label={`Decrease ${title} quantity`}
              className="size-9"
              disabled={!canDecrement}
              onClick={() => updateQuantity(optimisticQuantity - 1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Minus aria-hidden className="size-3.5" />
            </Button>
            <span
              aria-live="polite"
              className={cn(
                "inline-flex h-9 min-w-12 items-center justify-center gap-1.5 text-sm text-on-light tabular-nums",
                isPending ? "text-on-light/55" : null,
              )}
            >
              {optimisticQuantity}
              {isPending ? <Spinner label="Updating quantity" size="sm" /> : null}
            </span>
            <Button
              aria-label={`Increase ${title} quantity`}
              className="size-9"
              disabled={!canIncrement}
              onClick={() => updateQuantity(optimisticQuantity + 1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Plus aria-hidden className="size-3.5" />
            </Button>
          </div>

          <Button
            aria-label={`Remove ${title}`}
            className="size-9 text-on-light/55 hover:text-oxblood"
            disabled={isPending}
            onClick={removeItem}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden className="size-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
