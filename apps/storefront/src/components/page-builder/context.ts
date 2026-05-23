import "server-only";

import { getMedusaClient } from "@/medusa/client";
import { getDefaultRegion } from "@/medusa/regions";
import type { StoreProduct } from "@/medusa/types";

import type { PageBuilderContext, PageBuilderModule } from "./types";

function addProductId(productIds: Set<string>, medusaProductId: string | null | undefined): void {
  const normalized = medusaProductId?.trim();

  if (normalized) {
    productIds.add(normalized);
  }
}

function collectProductIds(modules: PageBuilderModule[] | null | undefined): string[] {
  const productIds = new Set<string>();

  for (const builderModule of modules ?? []) {
    if (builderModule._type === "productRail") {
      for (const product of builderModule.products ?? []) {
        addProductId(productIds, product.medusaProductId);
      }
    }

    if (builderModule._type === "videoChapter") {
      for (const hotspot of builderModule.productHotspots ?? []) {
        addProductId(productIds, hotspot.product?.medusaProductId);
      }
    }
  }

  return [...productIds];
}

/**
 * Canonical server-side enrichment step for page-builder commerce data.
 * Sanity supplies editorial product references; Medusa supplies live price and availability.
 */
export async function resolvePageBuilderContext(
  modules: PageBuilderModule[] | null | undefined,
): Promise<PageBuilderContext> {
  const productIds = collectProductIds(modules);
  const medusaProducts = new Map<string, StoreProduct>();

  if (productIds.length === 0) {
    return { medusaProducts };
  }

  try {
    const region = await getDefaultRegion();
    const { products } = await getMedusaClient().store.product.list({
      fields:
        "id,title,handle,thumbnail,status,*variants,+variants.inventory_quantity,*variants.calculated_price",
      id: productIds,
      limit: productIds.length,
      region_id: region.id,
    });

    for (const product of products) {
      medusaProducts.set(product.id, product);
    }
  } catch {
    // Static builds must still render Sanity-only cards when Medusa is unavailable.
  }

  return { medusaProducts };
}
