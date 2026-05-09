import { sanityPublicEnv } from "@/lib/env";

export const apiVersion = "2026-03-01"; // pinned per AGENTS.md §4.3 #7
export const projectId = sanityPublicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = sanityPublicEnv.NEXT_PUBLIC_SANITY_DATASET;
export const studioUrl = "/studio";

if (!projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID for Sanity Studio and Content Lake reads.",
  );
}

if (!dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET for Sanity Studio and Content Lake reads.");
}
