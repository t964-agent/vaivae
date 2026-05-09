"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useCartUiStore } from "@/components/providers/cart-ui-provider";
import { Button, HStack } from "@/components/ui";
import { dispatchCartUpdated } from "@/lib/cart-events";
import { toast } from "@/lib/toast";
import { removeFromWishlistAction } from "@/medusa/account-actions";
import { addLineItemAction } from "@/medusa/actions";

type WishlistItemActionsProps = {
  canMoveToBag: boolean;
  itemId: string;
  title: string;
  variantId: string;
};

export function WishlistItemActions({
  canMoveToBag,
  itemId,
  title,
  variantId,
}: WishlistItemActionsProps) {
  const router = useRouter();
  const markAdded = useCartUiStore((store) => store.markAdded);
  const openCart = useCartUiStore((store) => store.open);
  const [isPending, startTransition] = useTransition();

  function removeItem(): void {
    startTransition(() => {
      void removeFromWishlistAction(itemId).then((result) => {
        if (!result.ok) {
          toast.error(result.error);
          return;
        }

        toast.success("Removed from wishlist");
        router.refresh();
      });
    });
  }

  function moveToBag(): void {
    if (!canMoveToBag) {
      toast.info("This piece is not available right now.");
      return;
    }

    startTransition(() => {
      void addLineItemAction({ quantity: 1, variantId }).then((cartResult) => {
        if (!cartResult.ok) {
          toast.error(cartResult.error || "Could not move this piece to your bag.");
          return;
        }

        dispatchCartUpdated(cartResult.cart);
        markAdded(variantId);
        openCart();

        void removeFromWishlistAction(itemId).then((wishlistResult) => {
          if (!wishlistResult.ok) {
            toast.warning("Added to bag, but it remains in your wishlist.");
            return;
          }

          toast.success(`${title} moved to bag`);
          router.refresh();
        });
      });
    });
  }

  return (
    <HStack gap={3} wrap>
      <Button disabled={isPending || !canMoveToBag} onClick={moveToBag} size="sm" type="button">
        Move to bag
      </Button>
      <Button disabled={isPending} onClick={removeItem} size="sm" type="button" variant="underline">
        Remove
      </Button>
    </HStack>
  );
}
