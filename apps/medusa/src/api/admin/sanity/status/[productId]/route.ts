import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import SanitySyncModule = require("../../../../../modules/sanity-sync");
import SanityProductSync = require("../../../../../workflows/sanity/sync-product");

const { SANITY_SYNC_MODULE } = SanitySyncModule;
const { extractMaterials, retrieveProductForSanitySync } = SanityProductSync;

type SanityProductMirror = {
  _id: string;
  handle: string | null;
  medusaProductId: string | null;
  mirrorMaterials: string[];
  title: string | null;
};

type SanitySyncService = {
  getProductMirror(productId: string): Promise<SanityProductMirror | null>;
};

type Drift = {
  field: "title" | "handle" | "mirrorMaterials";
  medusa: unknown;
  sanity: unknown;
};

function getProductId(req: AuthenticatedMedusaRequest): string | null {
  const productId = req.params.productId;

  return typeof productId === "string" ? productId.trim() || null : null;
}

function arraysEqual(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse): Promise<void> {
  const productId = getProductId(req);

  if (!productId) {
    res.status(400).json({ error: "invalid_product_id" });
    return;
  }

  const product = await retrieveProductForSanitySync(req.scope, productId);
  const medusa = {
    handle: product.handle,
    materials: extractMaterials(product),
    title: product.title,
  };
  const syncService = req.scope.resolve<SanitySyncService>(SANITY_SYNC_MODULE);
  const mirror = await syncService.getProductMirror(product.id);

  if (!mirror) {
    res.status(200).json({
      drift: [],
      inSync: false,
      medusa,
      productId: product.id,
      sanity: {
        exists: false,
        handle: null,
        mirrorMaterials: [],
        title: null,
      },
    });
    return;
  }

  const sanity = {
    exists: true,
    handle: mirror.handle,
    mirrorMaterials: mirror.mirrorMaterials,
    title: mirror.title,
  };
  const drift: Drift[] = [];

  if (medusa.title !== sanity.title) {
    drift.push({ field: "title", medusa: medusa.title, sanity: sanity.title });
  }

  if (medusa.handle !== sanity.handle) {
    drift.push({ field: "handle", medusa: medusa.handle, sanity: sanity.handle });
  }

  if (!arraysEqual(medusa.materials, sanity.mirrorMaterials)) {
    drift.push({
      field: "mirrorMaterials",
      medusa: medusa.materials,
      sanity: sanity.mirrorMaterials,
    });
  }

  res.status(200).json({
    drift,
    inSync: drift.length === 0,
    medusa,
    productId: product.id,
    sanity,
  });
}

module.exports.GET = GET;
