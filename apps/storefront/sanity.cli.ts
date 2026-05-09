import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./src/sanity/api";

const studioHost = process.env["SANITY_STUDIO_HOSTNAME"];

export default defineCliConfig({
  api: {
    dataset,
    projectId,
  },
  schemaExtraction: {
    enabled: true,
    path: "./src/sanity/schema.json",
  },
  ...(studioHost ? { studioHost } : {}),
});
