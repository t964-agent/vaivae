import type { SanityClient } from "@sanity/client";
import type * as SanityClientModule from "@sanity/client";

const { createClient } = require("@sanity/client") as typeof SanityClientModule;

const SANITY_API_VERSION = "2026-03-01";

type CreateSanityClientEnv = {
  projectId: string;
  dataset: string;
  writeToken: string;
};

function createSanityClient(env: CreateSanityClientEnv): SanityClient {
  return createClient({
    apiVersion: SANITY_API_VERSION,
    dataset: env.dataset,
    perspective: "published",
    projectId: env.projectId,
    token: env.writeToken,
    useCdn: false,
  });
}

module.exports = {
  SANITY_API_VERSION,
  createSanityClient,
};
