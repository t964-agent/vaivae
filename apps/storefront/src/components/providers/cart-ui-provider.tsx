"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "zustand";

import { createCartUiStore, type CartUiStore, type CartUiStoreApi } from "@/lib/cart-ui-store";

const CartUiStoreContext = createContext<CartUiStoreApi | null>(null);

type CartUiProviderProps = {
  children: ReactNode;
};

export function CartUiProvider({ children }: CartUiProviderProps) {
  const [store] = useState(() => createCartUiStore());

  return <CartUiStoreContext.Provider value={store}>{children}</CartUiStoreContext.Provider>;
}

export function useCartUiStore<T>(selector: (store: CartUiStore) => T): T {
  const store = useContext(CartUiStoreContext);

  if (!store) {
    throw new Error("useCartUiStore must be used within CartUiProvider.");
  }

  return useStore(store, selector);
}
