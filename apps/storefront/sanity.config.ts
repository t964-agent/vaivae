"use client";

import { codeInput } from "@sanity/code-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId, studioUrl } from "./src/sanity/api";
import { schemaTypes } from "./src/sanity/schemas";
import { createHiddenTypes, singletonTypes, structure } from "./src/sanity/structure";

const singletonTypeSet = new Set<string>(singletonTypes);
const blockedSingletonActions = new Set(["delete", "duplicate"]);
const createHiddenTypeSet = new Set<string>(createHiddenTypes);
const syncedDocumentTypeSet = new Set<string>(["product"]);
const blockedSyncedDocumentActions = new Set(["delete", "duplicate", "unpublish"]);
const studioHost = process.env["SANITY_STUDIO_HOSTNAME"];

export default defineConfig({
  basePath: studioUrl,
  dataset,
  document: {
    actions: (previousActions, context) => {
      if (syncedDocumentTypeSet.has(context.schemaType)) {
        return previousActions.filter((action) => {
          const actionName = action.action;

          return actionName ? !blockedSyncedDocumentActions.has(actionName) : true;
        });
      }

      if (!singletonTypeSet.has(context.schemaType)) {
        return previousActions;
      }

      return previousActions.filter((action) => {
        const actionName = action.action;

        return actionName ? !blockedSingletonActions.has(actionName) : true;
      });
    },
    newDocumentOptions: (previousOptions) =>
      previousOptions.filter((templateItem) => {
        const templateId = templateItem.templateId;

        return templateId ? !createHiddenTypeSet.has(templateId) : true;
      }),
  },
  name: "default",
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    codeInput(),
  ],
  projectId,
  schema: {
    types: schemaTypes,
  },
  ...(studioHost ? { studioHost } : {}),
  title: "vaïvae",
});
