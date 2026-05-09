import { createClient } from "@sanity/client";

import { apiVersion, dataset, projectId, studioUrl } from "./api";

export const client = createClient({
  apiVersion,
  dataset,
  perspective: "published",
  projectId,
  stega: {
    studioUrl,
  },
  useCdn: true,
});
