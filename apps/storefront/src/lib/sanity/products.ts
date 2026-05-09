import "server-only";

import { productsByMedusaIdsQuery } from "@/sanity/queries";
import { sanityFetch } from "@/sanity/live";
import type { ProductListQueryResult } from "@/sanity/types";

export type ProductEditorialFragment = ProductListQueryResult[number];

function normalizeIds(ids: readonly string[]): string[] {
  return Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean))).sort();
}

/**
 * Reverse of page-builder enrichment: Medusa supplies the visible product set,
 * then Sanity overlays editorial card fields by immutable Medusa product ID.
 */
export async function listEditorialProducts(
  medusaProductIds: string[],
): Promise<Map<string, ProductEditorialFragment>> {
  const normalizedIds = normalizeIds(medusaProductIds);
  const editorialByMedusaId = new Map<string, ProductEditorialFragment>();

  if (normalizedIds.length === 0) {
    return editorialByMedusaId;
  }

  try {
    const { data } = await sanityFetch({
      params: { medusaProductIds: normalizedIds },
      query: productsByMedusaIdsQuery,
      tags: ["product", "products"],
    });
    const products = Array.isArray(data) ? (data as ProductEditorialFragment[]) : [];

    for (const product of products) {
      if (typeof product.medusaProductId === "string" && product.medusaProductId.trim()) {
        editorialByMedusaId.set(product.medusaProductId, product);
      }
    }
  } catch {
    // Static builds should still render Medusa-only product cards if Sanity is unavailable.
  }

  return editorialByMedusaId;
}
