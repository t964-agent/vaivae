import type * as MedusaUtils from "@medusajs/framework/utils";
import SanitySyncModule = require("../../modules/sanity-sync");

const { Modules } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { SANITY_SYNC_MODULE } = SanitySyncModule;

type ResolutionContainer = {
  resolve<T>(key: string): T;
};

type ProductMetadata = Record<string, unknown> | null;

type ProductForSanitySync = {
  id: string;
  title: string;
  handle: string;
  metadata?: ProductMetadata;
};

type ProductModuleService = {
  retrieveProduct(
    productId: string,
    config: { select: Array<"id" | "title" | "handle" | "metadata"> },
  ): Promise<ProductForSanitySync>;
};

type SanitySyncProductInput = {
  handle: string;
  id: string;
  materials?: string[] | null;
  title: string;
};

type SanitySyncService = {
  deleteProduct(productId: string): Promise<void>;
  syncProduct(product: SanitySyncProductInput): Promise<void>;
};

type SyncedProductMirrorPayload = {
  productId: string;
  handle: string;
  mirrorMaterials: string[];
  title: string;
};

function extractMaterials(product: ProductForSanitySync): string[] {
  const materials = product.metadata?.["mirror_materials"];

  if (!Array.isArray(materials)) {
    return [];
  }

  return materials
    .filter((material): material is string => typeof material === "string")
    .map((material) => material.trim())
    .filter((material) => material.length > 0);
}

async function retrieveProductForSanitySync(
  container: ResolutionContainer,
  productId: string,
): Promise<ProductForSanitySync> {
  const productService = container.resolve<ProductModuleService>(Modules.PRODUCT);

  return productService.retrieveProduct(productId, {
    select: ["id", "title", "handle", "metadata"],
  });
}

function resolveSanitySyncService(container: ResolutionContainer): SanitySyncService {
  return container.resolve<SanitySyncService>(SANITY_SYNC_MODULE);
}

function toMirrorPayload(product: ProductForSanitySync): SyncedProductMirrorPayload {
  return {
    handle: product.handle,
    mirrorMaterials: extractMaterials(product),
    productId: product.id,
    title: product.title,
  };
}

async function syncProductById(
  container: ResolutionContainer,
  productId: string,
): Promise<SyncedProductMirrorPayload> {
  const product = await retrieveProductForSanitySync(container, productId);
  const payload = toMirrorPayload(product);
  const syncService = resolveSanitySyncService(container);

  await syncService.syncProduct({
    handle: payload.handle,
    id: payload.productId,
    materials: payload.mirrorMaterials,
    title: payload.title,
  });

  return payload;
}

async function deleteProductMirrorById(
  container: ResolutionContainer,
  productId: string,
): Promise<void> {
  const syncService = resolveSanitySyncService(container);

  await syncService.deleteProduct(productId);
}

const exported = {
  deleteProductMirrorById,
  extractMaterials,
  resolveSanitySyncService,
  retrieveProductForSanitySync,
  syncProductById,
};

export = exported;
