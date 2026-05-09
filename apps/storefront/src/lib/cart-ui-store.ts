"use client";

import { createStore, type StoreApi } from "zustand/vanilla";

export type CartUiState = {
  isOpen: boolean;
  lastAddedVariantId: string | null;
  recentlyAddedAt: number | null;
};

export type CartUiActions = {
  clearRecentlyAdded: () => void;
  close: () => void;
  markAdded: (variantId: string) => void;
  open: () => void;
  toggle: () => void;
};

export type CartUiStore = CartUiState & CartUiActions;
export type CartUiStoreApi = StoreApi<CartUiStore>;

export const defaultCartUiState: CartUiState = {
  isOpen: false,
  lastAddedVariantId: null,
  recentlyAddedAt: null,
};

export function createCartUiStore(initialState: Partial<CartUiState> = {}): CartUiStoreApi {
  return createStore<CartUiStore>()((set) => ({
    ...defaultCartUiState,
    ...initialState,
    clearRecentlyAdded: () => set({ lastAddedVariantId: null, recentlyAddedAt: null }),
    close: () => set({ isOpen: false }),
    markAdded: (variantId) =>
      set({ isOpen: true, lastAddedVariantId: variantId, recentlyAddedAt: Date.now() }),
    open: () => set({ isOpen: true }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  }));
}
