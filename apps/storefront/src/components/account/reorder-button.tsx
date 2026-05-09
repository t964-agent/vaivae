"use client";

import { useTransition } from "react";

import { useCartUiStore } from "@/components/providers/cart-ui-provider";
import { Button } from "@/components/ui";
import { dispatchCartUpdated } from "@/lib/cart-events";
import { toast } from "@/lib/toast";
import { reorderAction } from "@/medusa/account-actions";

type ReorderButtonProps = {
  orderId: string;
};

export function ReorderButton({ orderId }: ReorderButtonProps) {
  const markAdded = useCartUiStore((store) => store.markAdded);
  const openCart = useCartUiStore((store) => store.open);
  const [isPending, startTransition] = useTransition();

  function handleReorder(): void {
    startTransition(() => {
      void reorderAction(orderId).then((result) => {
        if (!result.ok) {
          toast.error(result.error);
          return;
        }

        const lastVariantId = result.data?.items?.at(-1)?.variant_id;

        if (lastVariantId) {
          markAdded(lastVariantId);
        } else {
          openCart();
        }

        dispatchCartUpdated(result.data);
        toast.success("Order added to bag");
      });
    });
  }

  return (
    <Button loading={isPending} onClick={handleReorder} type="button" variant="ghost">
      Reorder available pieces
    </Button>
  );
}
