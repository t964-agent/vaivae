import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import SyncOneProduct = require("../../../../../workflows/sanity/steps/sync-one-product");

const { syncProductById } = SyncOneProduct;

function getProductId(req: AuthenticatedMedusaRequest): string | null {
  const productId = req.params.productId;

  return typeof productId === "string" ? productId.trim() || null : null;
}

async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse): Promise<void> {
  const productId = getProductId(req);

  if (!productId) {
    res.status(400).json({ error: "invalid_product_id" });
    return;
  }

  const payload = await syncProductById(req.scope, productId);

  res.status(200).json(payload);
}

module.exports.POST = POST;
