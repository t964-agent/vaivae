import type { StoreCart } from "@/medusa/types";

export function getCartItemCount(cart: StoreCart | null | undefined): number {
  return (cart?.items ?? []).reduce((count, item) => count + Math.max(0, item.quantity), 0);
}
