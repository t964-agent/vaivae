import "server-only";

import { getMedusaClient } from "@/medusa/client";
import { getDefaultRegion } from "@/medusa/regions";
import type { StoreProduct } from "@/medusa/types";

import type { PageBuilderContext, PageBuilderModule } from "./types";

function addHandle(handles: Set<string>, handle: string | null | undefined): void {
  const normalized = handle?.trim();

  if (normalized) {
    handles.add(normalized);
  }
}

function collectProductHandles(modules: PageBuilderModule[] | null | undefined): string[] {
  const handles = new Set<string>();

  for (const builderModule of modules ?? []) {
    if (builderModule._type === "productRail") {
      for (const product of builderModule.products ?? []) {
        addHandle(handles, product.handle);
      }
    }

    if (builderModule._type === "videoChapter") {
      for (const hotspot of builderModule.productHotspots ?? []) {
        addHandle(handles, hotspot.product?.handle);
      }
    }
  }

  return [...handles];
}

/**
 * Canonical server-side enrichment step for page-builder commerce data.
 * Sanity supplies editorial product references; Medusa supplies live price and availability.
 */
export async function resolvePageBuilderContext(
  modules: PageBuilderModule[] | null | undefined,
): Promise<PageBuilderContext> {
  const handles = collectProductHandles(modules);
  const medusaProducts = new Map<string, StoreProduct>();

  if (handles.length === 0) {
    return { medusaProducts };
  }

  try {
    const region = await getDefaultRegion();
    const { products } = await getMedusaClient().store.product.list({
      fields:
        "id,title,handle,thumbnail,status,*variants,+variants.inventory_quantity,*variants.calculated_price",
      handle: handles,
      limit: handles.length,
      region_id: region.id,
    });

    for (const product of products) {
      if (product.handle) {
        medusaProducts.set(product.handle, product);
      }
    }
  } catch {
    // Static builds must still render Sanity-only cards when Medusa is unavailable.
  }

  return { medusaProducts };
}
