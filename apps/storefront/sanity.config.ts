"use client";

import { codeInput } from "@sanity/code-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId, studioUrl } from "./src/sanity/api";
import { schemaTypes } from "./src/sanity/schemas";
import { singletonTypes, structure } from "./src/sanity/structure";

const singletonTypeSet = new Set<string>(singletonTypes);
const studioHost = process.env["SANITY_STUDIO_HOSTNAME"];

export default defineConfig({
  basePath: studioUrl,
  dataset,
  document: {
    newDocumentOptions: (previousOptions) =>
      previousOptions.filter((templateItem) => {
        const templateId = templateItem.templateId;

        return templateId ? !singletonTypeSet.has(templateId) : true;
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
