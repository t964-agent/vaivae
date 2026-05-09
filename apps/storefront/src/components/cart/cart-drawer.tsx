"use client";

import { X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState } from "react";

import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { useCartUiStore } from "@/components/providers/cart-ui-provider";
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui";
import { CART_UPDATED_EVENT, isCartUpdatedEvent } from "@/lib/cart-events";
import { track } from "@/lib/analytics/track";
import { getCartItemCount } from "@/lib/cart-utils";
import type { StoreCart } from "@/medusa/types";

type CartDrawerProps = {
  initialCart: StoreCart | null;
};

type OptimisticCartAction = {
  lineItemId: string;
  type: "remove";
};

function optimisticCartReducer(
  cart: StoreCart | null,
  action: OptimisticCartAction,
): StoreCart | null {
  if (!cart) {
    return cart;
  }

  if (action.type === "remove") {
    return {
      ...cart,
      items: (cart.items ?? []).filter((item) => item.id !== action.lineItemId),
    };
  }

  return cart;
}

function getCartValue(cart: StoreCart | null): number {
  return typeof cart?.total === "number" ? cart.total / 100 : 0;
}

function getCurrencyCode(currencyCode: string | null | undefined): string {
  return (currencyCode?.trim() || "usd").toUpperCase();
}

export function CartDrawer({ initialCart }: CartDrawerProps) {
  const pathname = usePathname();
  const isOpen = useCartUiStore((store) => store.isOpen);
  const open = useCartUiStore((store) => store.open);
  const close = useCartUiStore((store) => store.close);
  const [cart, setCart] = useState<StoreCart | null>(initialCart);
  const [statusMessage, setStatusMessage] = useState("");
  const [optimisticCart, applyOptimisticCart] = useOptimistic(cart, optimisticCartReducer);
  const lastTrackedOpenRef = useRef<string | null>(null);
  const items = optimisticCart?.items ?? [];
  const hasItems = items.length > 0;
  const itemCount = getCartItemCount(optimisticCart);
  const currencyCode = optimisticCart?.currency_code ?? cart?.currency_code ?? "usd";

  useEffect(() => {
    function handleCartUpdated(event: Event): void {
      if (!isCartUpdatedEvent(event)) {
        return;
      }

      setCart(event.detail.cart);
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    close();
  }, [close, pathname]);

  useEffect(() => {
    if (!isOpen || !optimisticCart || !hasItems) {
      return;
    }

    const trackingKey = `${optimisticCart.id}:${itemCount}:${optimisticCart.total ?? 0}`;

    if (lastTrackedOpenRef.current === trackingKey) {
      return;
    }

    lastTrackedOpenRef.current = trackingKey;
    track({
      name: "view_cart",
      props: {
        cartId: optimisticCart.id,
        currency: getCurrencyCode(optimisticCart.currency_code),
        value: getCartValue(optimisticCart),
      },
    });
  }, [hasItems, isOpen, itemCount, optimisticCart]);

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      open();
      return;
    }

    close();
  }

  function handleOptimisticRemove(lineItemId: string): void {
    applyOptimisticCart({ lineItemId, type: "remove" });
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent
        aria-describedby="cart-drawer-description"
        className="flex h-dvh max-h-dvh flex-col overflow-hidden p-0 sm:max-w-[480px]"
        showCloseButton={false}
        side="right"
      >
        <DrawerHeader className="shrink-0 border-b border-on-light/10 px-6 py-6 pr-16 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-2">
              <DrawerTitle>
                Your bag
                {itemCount > 0 ? <span className="text-on-light/45"> ({itemCount})</span> : null}
              </DrawerTitle>
              <DrawerDescription id="cart-drawer-description">
                Review selected pieces and continue to checkout.
              </DrawerDescription>
            </div>
            <DrawerClose
              aria-label="Close cart"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-on-light/65 transition-colors hover:bg-on-light/5 hover:text-on-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
            >
              <X aria-hidden className="size-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <p aria-atomic="true" aria-live="polite" className="sr-only" role="status">
          {statusMessage}
        </p>

        {hasItems ? (
          <>
            <ul
              aria-label="Cart items"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-8"
            >
              {items.map((item) => (
                <CartLineItem
                  currencyCode={currencyCode}
                  item={item}
                  key={item.id}
                  onCartChange={setCart}
                  onOptimisticRemove={handleOptimisticRemove}
                  onStatus={setStatusMessage}
                />
              ))}
            </ul>

            {cart ? (
              <DrawerFooter className="mt-0 shrink-0 border-t border-on-light/10 bg-cream px-6 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-8">
                <CartSummary cart={cart} />
                <Button asChild className="mt-2 w-full" size="lg">
                  <Link href={"/checkout" as Route}>Checkout</Link>
                </Button>
              </DrawerFooter>
            ) : null}
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col justify-center px-6 py-12 sm:px-8">
            <div className="grid max-w-sm gap-6">
              <p className="font-body text-[0.68rem] tracking-[0.22em] text-on-light/45 uppercase">
                Bag
              </p>
              <div className="grid gap-4">
                <h2 className="font-display text-4xl leading-none font-light tracking-[-0.05em] text-on-light italic">
                  Your bag is empty.
                </h2>
                <p className="text-sm leading-6 text-on-light/62">
                  Begin with the collection: a considered edit of pieces for living.
                </p>
              </div>
              <Button asChild className="w-fit" variant="ghost">
                <Link href={"/products" as Route}>Discover the collection</Link>
              </Button>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
