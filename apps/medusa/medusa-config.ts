import type { InputConfigModules, ProjectConfigOptions } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";

// IMPORTANT: medusa-config.ts is loaded by Medusa's `getConfigFile` via a plain
// `require()` BEFORE Medusa's TypeScript runtime is set up for the rest of the
// codebase. That means relative imports from this file (e.g. "./src/lib/env")
// can't resolve `.ts` files at runtime — Node only sees `.js`. If anything in
// this file throws, Medusa's loader silently returns `null` (with
// `throwOnError: false` during `medusa build`) and then crashes downstream
// with "Cannot read properties of null (reading 'admin')".
//
// Therefore: read `process.env` directly here. Do not import from src/.
// Heavyweight env validation (Zod) lives in src/lib/env.ts and is used by
// modules, subscribers, workflows, and API routes — all of which are loaded
// AFTER the TS runtime is ready.
//
// We use `require()` for runtime values because the file uses CJS
// `module.exports = defineConfig(...)` (matching Medusa's official starter).
// Pure ESM imports + module.exports is rejected by `verbatimModuleSyntax`.

const { defineConfig, loadEnv } = require("@medusajs/framework/utils") as typeof MedusaUtils;

loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd());

const isMedusaBuildCommand = process.argv.includes("build");

// During `medusa build` (which runs in CI/CD without real env vars), substitute
// safe placeholder values so the build can complete. Runtime config still
// requires real values via the same env keys.
function envOrBuildDefault(key: string, buildDefault: string): string {
  const value = process.env[key];
  if (value && value.trim() !== "") {
    return value;
  }
  if (isMedusaBuildCommand) {
    return buildDefault;
  }
  throw new Error(
    `Missing required environment variable: ${key}. Set it in Medusa Cloud → Environment Variables.`,
  );
}

function envOptional(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim() !== "" ? value : undefined;
}

const redisUrl = envOptional("REDIS_URL");
const enableExplicitRedisModules = process.env["ENABLE_EXPLICIT_REDIS_MODULES"] === "true";

const databaseUrl = envOrBuildDefault(
  "DATABASE_URL",
  "postgres://postgres:postgres@localhost:5432/vaivae_medusa_build",
);
const jwtSecret = envOrBuildDefault("JWT_SECRET", "medusa-build-jwt-secret");
const cookieSecret = envOrBuildDefault("COOKIE_SECRET", "medusa-build-cookie-secret");
const storeCors = envOrBuildDefault("STORE_CORS", "http://localhost:3000");
const adminCors = envOrBuildDefault("ADMIN_CORS", "http://localhost:9000");
const authCors = envOrBuildDefault("AUTH_CORS", "http://localhost:3000");
const medusaBackendUrl = envOrBuildDefault("MEDUSA_BACKEND_URL", "http://localhost:9000");
const medusaStorefrontUrl = envOrBuildDefault("MEDUSA_STOREFRONT_URL", "http://localhost:3000");
const stripeApiKey = envOrBuildDefault("STRIPE_API_KEY", "sk_test_medusa_build_placeholder");
const stripeWebhookSecret = envOrBuildDefault(
  "STRIPE_WEBHOOK_SECRET",
  "whsec_medusa_build_placeholder",
);
const posthogApiKey = envOrBuildDefault("POSTHOG_API_KEY", "phc_medusa_build_placeholder");
const posthogHost = process.env["POSTHOG_HOST"] ?? "https://us.i.posthog.com";

const workerModeRaw = process.env["MEDUSA_WORKER_MODE"];
const workerMode: "shared" | "worker" | "server" =
  workerModeRaw === "worker" || workerModeRaw === "server" ? workerModeRaw : "shared";

// Medusa Cloud auto-configures Caching, Event Bus, Workflow Engine, and Locking
// modules with Redis. Only add explicit Redis modules when running outside Cloud
// (set ENABLE_EXPLICIT_REDIS_MODULES=true). See AGENTS.md §4.5.
const redisModules: InputConfigModules =
  enableExplicitRedisModules && redisUrl
    ? [
        {
          resolve: "@medusajs/medusa/caching",
          options: {
            providers: [
              {
                resolve: "@medusajs/medusa/caching-redis",
                id: "redis",
                options: { redisUrl },
              },
            ],
          },
        },
        {
          resolve: "@medusajs/medusa/event-bus-redis",
          options: { redisUrl },
        },
        {
          resolve: "@medusajs/medusa/workflow-engine-redis",
          options: { redis: { redisUrl } },
        },
        {
          resolve: "@medusajs/medusa/locking",
          options: {
            providers: [
              {
                resolve: "@medusajs/medusa/locking-redis",
                id: "redis",
                options: { redisUrl },
              },
            ],
          },
        },
      ]
    : [];

const modules: InputConfigModules = [
  {
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/payment-stripe",
          id: "stripe",
          options: {
            apiKey: stripeApiKey,
            webhookSecret: stripeWebhookSecret,
            capture: true,
          },
        },
      ],
    },
  },
  {
    resolve: "@medusajs/medusa/analytics",
    options: {
      providers: [
        {
          resolve: "@medusajs/analytics-posthog",
          id: "posthog",
          options: {
            posthogEventsKey: posthogApiKey,
            posthogHost,
          },
        },
      ],
    },
  },
  {
    resolve: "./src/modules/marketing-consent",
  },
  {
    resolve: "./src/modules/klaviyo",
  },
  {
    resolve: "./src/modules/sanity-sync",
  },
  {
    resolve: "./src/modules/shipping-shippo",
  },
  ...redisModules,
];

const projectConfig: ProjectConfigOptions = {
  databaseUrl,
  workerMode,
  http: {
    storeCors,
    adminCors,
    authCors,
    jwtSecret,
    cookieSecret,
  },
};

if (redisUrl) {
  projectConfig.redisUrl = redisUrl;
}

module.exports = defineConfig({
  projectConfig,
  admin: {
    backendUrl: medusaBackendUrl,
    storefrontUrl: medusaStorefrontUrl,
    path: "/app",
  },
  modules,
  plugins: [
    {
      resolve: "@alphabite/medusa-wishlist",
      options: {
        wishlistFields: [],
        wishlistItemsFields: [],
        includeWishlistItems: true,
        includeWishlistItemsTake: 5,
        allowGuestWishlist: true,
      },
    },
  ],
  featureFlags: {},
});

// Stripe webhook auto-mounted by @medusajs/payment-stripe at /hooks/payment/stripe_stripe.
// In production, point Stripe Dashboard → Webhooks → endpoint at https://api.vaivae.com/hooks/payment/stripe_stripe.
