import "server-only";

import Medusa from "@medusajs/js-sdk";

import { getPublicEnv } from "@/lib/env";

type MedusaClient = InstanceType<typeof Medusa>;

let client: MedusaClient | undefined;

function assertMedusaEnv(): void {
  if (process.env["NODE_ENV"] === "test") {
    return;
  }

  const missing = ["NEXT_PUBLIC_MEDUSA_BACKEND_URL", "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"].filter(
    (key) => !process.env[key]?.trim(),
  );

  if (missing.length > 0) {
    throw new Error(`Missing storefront Medusa environment variables: ${missing.join(", ")}`);
  }
}

assertMedusaEnv();

export function getMedusaClient(): MedusaClient {
  if (client) {
    return client;
  }

  const { NEXT_PUBLIC_MEDUSA_BACKEND_URL, NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY } = getPublicEnv();

  client = new Medusa({
    baseUrl: NEXT_PUBLIC_MEDUSA_BACKEND_URL,
    debug: false,
    publishableKey: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  });

  return client;
}
