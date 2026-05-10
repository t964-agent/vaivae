import type { StoreCart } from "@/medusa/types";

import { describe, expect, it } from "vitest";

import { getCartItemCount } from "@/lib/cart-utils";

describe("getCartItemCount", () => {
  it("sums positive line-item quantities", () => {
    // Arrange
    const cart = {
      items: [{ quantity: 2 }, { quantity: 3 }, { quantity: 0 }],
    } as unknown as StoreCart;

    // Act
    const count = getCartItemCount(cart);

    // Assert
    expect(count).toBe(5);
  });

  it("ignores negative quantities and missing carts", () => {
    // Arrange
    const cart = {
      items: [{ quantity: -2 }, { quantity: 1 }],
    } as unknown as StoreCart;

    // Act / Assert
    expect(getCartItemCount(cart)).toBe(1);
    expect(getCartItemCount(null)).toBe(0);
    expect(getCartItemCount(undefined)).toBe(0);
  });
});
