import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type { IWorkflowEngineService } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";

const { ContainerRegistrationKeys, Modules } =
  require("@medusajs/framework/utils") as typeof MedusaUtils;

const SYNC_ALL_SANITY_PRODUCTS_WORKFLOW_NAME = "sync-all-sanity-products";

type WorkflowLogger = {
  info(details: Record<string, unknown>, message: string): void;
};

type WorkflowRunAcknowledgement = {
  acknowledgement: {
    transactionId: string;
    workflowId: string;
  };
};

async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse): Promise<void> {
  const logger = req.scope.resolve<WorkflowLogger>(ContainerRegistrationKeys.LOGGER);
  const workflowEngineService = req.scope.resolve<IWorkflowEngineService>(Modules.WORKFLOW_ENGINE);
  const { acknowledgement } = (await workflowEngineService.run(
    SYNC_ALL_SANITY_PRODUCTS_WORKFLOW_NAME,
    {
      input: {},
      throwOnError: false,
    },
  )) as WorkflowRunAcknowledgement;

  logger.info(
    {
      transactionId: acknowledgement.transactionId,
      workflowName: acknowledgement.workflowId,
    },
    "Triggered Sanity product bulk resync workflow",
  );

  res.status(202).json({
    transactionId: acknowledgement.transactionId,
    workflowName: acknowledgement.workflowId,
  });
}

module.exports.POST = POST;
