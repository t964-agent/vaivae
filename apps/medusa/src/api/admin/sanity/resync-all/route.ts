import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import syncAllSanityProductsWorkflow = require("../../../../workflows/sanity/sync-all-products");

const SYNC_ALL_SANITY_PRODUCTS_WORKFLOW_ID = "sync-all-sanity-products";

async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse): Promise<void> {
  const { transaction } = await syncAllSanityProductsWorkflow(req.scope).run({ input: {} });

  res.status(202).json({
    transactionId: transaction.transactionId,
    workflowExecutionId: transaction.transactionId,
    workflowId: SYNC_ALL_SANITY_PRODUCTS_WORKFLOW_ID,
  });
}

module.exports.POST = POST;
