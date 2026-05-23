import type * as MedusaUtils from "@medusajs/framework/utils";
import type * as WorkflowSdk from "@medusajs/framework/workflows-sdk";
import SanityProductSync = require("./sync-product");

const { ContainerRegistrationKeys, Modules } =
  require("@medusajs/framework/utils") as typeof MedusaUtils;
const { createStep, createWorkflow, StepResponse, WorkflowResponse } =
  require("@medusajs/framework/workflows-sdk") as typeof WorkflowSdk;

const { syncProductById } = SanityProductSync;
const BATCH_SIZE = 50;
const SYNC_ALL_SANITY_PRODUCTS_WORKFLOW_ID = "sync-all-sanity-products";

type ResolutionContainer = {
  resolve<T>(key: string): T;
};

type ProductListItem = {
  id: string;
};

type ProductModuleService = {
  listAndCountProducts(
    filters?: Record<string, never>,
    config?: { select?: Array<"id">; skip?: number; take?: number },
  ): Promise<[ProductListItem[], number]>;
};

type WorkflowLogger = {
  error(details: Record<string, unknown>, message: string): void;
  info(details: Record<string, unknown>, message: string): void;
};

type SyncAllProductsResult = {
  failed: number;
  succeeded: number;
  total: number;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown Sanity product sync error.";
}

async function syncProductBatch(input: {
  container: ResolutionContainer;
  logger: WorkflowLogger;
  productIds: string[];
}): Promise<{ failed: number; succeeded: number }> {
  const results = await Promise.allSettled(
    input.productIds.map((productId) => syncProductById(input.container, productId)),
  );
  let failed = 0;
  let succeeded = 0;

  results.forEach((result, index) => {
    const productId = input.productIds[index];

    if (!productId) {
      return;
    }

    if (result.status === "fulfilled") {
      succeeded += 1;
      input.logger.info({ productId }, "Sanity product resync succeeded");
      return;
    }

    failed += 1;
    input.logger.error(
      {
        errorMessage: getErrorMessage(result.reason),
        productId,
      },
      "Sanity product resync failed",
    );
  });

  return { failed, succeeded };
}

const syncAllSanityProductsStep = createStep(
  {
    name: "sync-all-sanity-products-step",
    retryInterval: 1,
  },
  async (_, { container }) => {
    const scopedContainer = container as ResolutionContainer;
    const logger = scopedContainer.resolve<WorkflowLogger>(ContainerRegistrationKeys.LOGGER);
    const productService = scopedContainer.resolve<ProductModuleService>(Modules.PRODUCT);
    const counts: SyncAllProductsResult = {
      failed: 0,
      succeeded: 0,
      total: 0,
    };
    let skip = 0;

    logger.info({ batchSize: BATCH_SIZE }, "Starting Sanity product bulk resync");

    while (skip === 0 || skip < counts.total) {
      const [products, total] = await productService.listAndCountProducts(
        {},
        {
          select: ["id"],
          skip,
          take: BATCH_SIZE,
        },
      );

      counts.total = total;

      if (products.length === 0) {
        break;
      }

      const batchCounts = await syncProductBatch({
        container: scopedContainer,
        logger,
        productIds: products.map((product) => product.id),
      });

      counts.failed += batchCounts.failed;
      counts.succeeded += batchCounts.succeeded;
      skip += products.length;
    }

    logger.info(counts, "Finished Sanity product bulk resync");

    return new StepResponse(counts);
  },
);

const syncAllSanityProductsWorkflow = createWorkflow(
  {
    name: SYNC_ALL_SANITY_PRODUCTS_WORKFLOW_ID,
    retentionTime: 60 * 60 * 24 * 14,
    store: true,
  },
  function () {
    const result = syncAllSanityProductsStep().config({
      async: true,
      backgroundExecution: true,
    });

    return new WorkflowResponse(result);
  },
);

export = syncAllSanityProductsWorkflow;
