import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { StoreProduct } from "@/medusa/types";

vi.mock("@/components/atoms/vaivae-image", () => ({
  VaivaeImage: () => null,
}));

import {
  ProductCard,
  productCardMedusaFromStoreProduct,
  type ProductCardMedusa,
  type ProductCardSanity,
} from "./product-card";

describe("ProductCard", () => {
  it("renders editorial and commerce data as a product link", () => {
    // Arrange
    const medusa = {
      available: true,
      handle: "terracotta-slip",
      id: "prod_terracotta",
      price: { amount: 118000, currency_code: "usd" },
      title: "Fallback title",
    } satisfies ProductCardMedusa;
    const sanity = {
      _id: "prod_terracotta",
      handle: "terracotta-slip",
      oneLineHook: "Cut on the bias, made for late light.",
      title: "Terracotta slip",
    } satisfies ProductCardSanity;

    // Act
    render(<ProductCard eyebrow="Drop 01" medusa={medusa} sanity={sanity} />);

    // Assert
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/terracotta-slip");
    expect(screen.getByRole("heading", { level: 3, name: "Terracotta slip" })).toBeVisible();
    expect(screen.getByText("Cut on the bias, made for late light.")).toBeVisible();
    expect(screen.getByLabelText("Price: $1,180.00")).toBeVisible();
    expect(screen.getByRole("img", { name: "Terracotta slip image pending" })).toBeVisible();
  });

  it("marks unavailable products without changing the price copy", () => {
    // Arrange
    const medusa = {
      available: false,
      handle: "linen-coat",
      id: "prod_linen",
      price: { amount: 162000, currency_code: "usd" },
      title: "Linen coat",
    } satisfies ProductCardMedusa;

    // Act
    render(<ProductCard medusa={medusa} />);

    // Assert
    expect(screen.getByText("Soon")).toBeVisible();
    expect(screen.getByLabelText("Price: $1,620.00")).toBeVisible();
  });

  it("renders a non-link card when no handle is available", () => {
    // Arrange
    const medusa = {
      available: true,
      handle: null,
      id: "prod_pending",
      price: null,
      title: null,
    } satisfies ProductCardMedusa;

    // Act
    render(<ProductCard layout="compact" medusa={medusa} />);

    // Assert
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("article")).toBeVisible();
    expect(screen.getByText("Untitled product")).toBeVisible();
    expect(screen.getByLabelText("Price: Available soon")).toBeVisible();
  });

  it("derives card data from a Medusa store product", () => {
    // Arrange
    const product = {
      handle: "glacial-jacket",
      id: "prod_glacial",
      title: "Glacial jacket",
      variants: [
        {
          allow_backorder: false,
          calculated_price: { calculated_amount: 142000, currency_code: "usd" },
          inventory_quantity: 0,
          manage_inventory: true,
        },
        {
          allow_backorder: true,
          inventory_quantity: 0,
          manage_inventory: true,
        },
      ],
    } as unknown as StoreProduct;

    // Act
    const cardProduct = productCardMedusaFromStoreProduct(product);

    // Assert
    expect(cardProduct).toEqual({
      available: true,
      handle: "glacial-jacket",
      id: "prod_glacial",
      price: { amount: 142000, currency_code: "usd" },
      title: "Glacial jacket",
    });
  });
});
