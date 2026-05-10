/// <reference types="vitest/globals" />

import type { MedusaEnv } from "./env";

type EnvModule = {
  default?: { env?: MedusaEnv };
  env?: MedusaEnv;
};

const validEnv = {
  ADMIN_CORS: "http://localhost:9000",
  AUTH_CORS: "http://localhost:3000",
  COOKIE_SECRET: "test-cookie-secret",
  DATABASE_URL: "postgres://postgres:postgres@localhost:5432/vaivae_test",
  JWT_SECRET: "test-jwt-secret",
  MEDUSA_BACKEND_URL: "http://localhost:9000",
  MEDUSA_STOREFRONT_URL: "http://localhost:3000",
  POSTHOG_API_KEY: "phc_test",
  SANITY_PROJECT_ID: "test-project",
  SANITY_WRITE_TOKEN: "test-sanity-token",
  STORE_CORS: "http://localhost:3000",
  STRIPE_API_KEY: "sk_test_vaivae",
  STRIPE_WEBHOOK_SECRET: "whsec_vaivae",
} satisfies Record<string, string>;

function getEnvExport(module: unknown): MedusaEnv {
  const loaded = module as EnvModule;
  const env = loaded.env ?? loaded.default?.env;

  if (!env) {
    throw new Error("Expected env export to be available.");
  }

  return env;
}

async function loadEnv(overrides: Partial<typeof validEnv> = {}): Promise<MedusaEnv> {
  vi.resetModules();
  vi.spyOn(process, "emitWarning").mockImplementation(() => undefined);

  for (const [key, value] of Object.entries({ ...validEnv, ...overrides })) {
    vi.stubEnv(key, value);
  }

  const module = await import("./env.js");

  return getEnvExport(module);
}

describe("Medusa env validation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("parses valid required input and applies defaults", async () => {
    // Arrange / Act
    const env = await loadEnv();

    // Assert
    expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(env.MEDUSA_WORKER_MODE).toBe("shared");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.ENABLE_EXPLICIT_REDIS_MODULES).toBe(false);
    expect(env.POSTHOG_HOST).toBe("https://us.i.posthog.com");
    expect(env.SANITY_DATASET).toBe("production");
  });

  it("rejects placeholder required values", async () => {
    // Arrange / Act / Assert
    await expect(loadEnv({ DATABASE_URL: "<DATABASE_URL>" })).rejects.toThrow(
      /DATABASE_URL must be replaced with a real value/,
    );
  });
});
