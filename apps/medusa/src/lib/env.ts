import type * as MedusaUtils from "@medusajs/framework/utils";
import type * as MedusaZod from "@medusajs/framework/zod";

const { z } = require("@medusajs/framework/zod") as typeof MedusaZod;
const { loadEnv } = require("@medusajs/framework/utils") as typeof MedusaUtils;

loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd());

const isMedusaBuildCommand = process.argv.includes("build");

const buildDefaults = {
  DATABASE_URL: "postgres://postgres:postgres@localhost:5432/vaivae_medusa_build",
  JWT_SECRET: "medusa-build-jwt-secret",
  COOKIE_SECRET: "medusa-build-cookie-secret",
  STORE_CORS: "http://localhost:3000",
  ADMIN_CORS: "http://localhost:9000",
  AUTH_CORS: "http://localhost:3000",
  MEDUSA_BACKEND_URL: "http://localhost:9000",
  MEDUSA_STOREFRONT_URL: "http://localhost:3000",
  STRIPE_API_KEY: "sk_test_medusa_build_placeholder",
  STRIPE_WEBHOOK_SECRET: "whsec_medusa_build_placeholder",
  POSTHOG_API_KEY: "phc_medusa_build_placeholder",
  SANITY_PROJECT_ID: "medusa-build-sanity-project",
  SANITY_WRITE_TOKEN: "medusa-build-sanity-write-token",
} as const;

type BuildDefaultKey = keyof typeof buildDefaults;

const placeholderPattern = /^<.*>$/;

function valueOrBuildDefault(key: BuildDefaultKey): string | undefined {
  return process.env[key] ?? (isMedusaBuildCommand ? buildDefaults[key] : undefined);
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed || placeholderPattern.test(trimmed)) {
    return undefined;
  }

  return trimmed;
}

function requiredString(key: string) {
  return z
    .string({ error: `${key} is required` })
    .trim()
    .min(1, `${key} is required`)
    .refine(
      (value) => !placeholderPattern.test(value),
      `${key} must be replaced with a real value`,
    );
}

const booleanFlag = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  DATABASE_URL: requiredString("DATABASE_URL"),
  REDIS_URL: z.preprocess(optionalString, z.string().optional()),
  ENABLE_EXPLICIT_REDIS_MODULES: booleanFlag,
  MEDUSA_WORKER_MODE: z.enum(["shared", "worker", "server"]).default("shared"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),

  JWT_SECRET: requiredString("JWT_SECRET"),
  COOKIE_SECRET: requiredString("COOKIE_SECRET"),

  STORE_CORS: requiredString("STORE_CORS"),
  ADMIN_CORS: requiredString("ADMIN_CORS"),
  AUTH_CORS: requiredString("AUTH_CORS"),
  MEDUSA_BACKEND_URL: requiredString("MEDUSA_BACKEND_URL"),
  MEDUSA_STOREFRONT_URL: requiredString("MEDUSA_STOREFRONT_URL"),

  STRIPE_API_KEY: requiredString("STRIPE_API_KEY"),
  STRIPE_WEBHOOK_SECRET: requiredString("STRIPE_WEBHOOK_SECRET"),

  POSTHOG_API_KEY: requiredString("POSTHOG_API_KEY"),
  POSTHOG_HOST: z.preprocess(optionalString, z.string().default("https://us.i.posthog.com")),

  KLAVIYO_PRIVATE_API_KEY: z.preprocess(optionalString, z.string().optional()),
  KLAVIYO_PUBLIC_API_KEY: z.preprocess(optionalString, z.string().optional()),

  SHIPPO_API_KEY: z.preprocess(optionalString, z.string().optional()),
  SHIPPING_LABEL_AUTOPURCHASE: booleanFlag,

  MUX_TOKEN_ID: z.preprocess(optionalString, z.string().optional()),
  MUX_TOKEN_SECRET: z.preprocess(optionalString, z.string().optional()),

  SANITY_PROJECT_ID: requiredString("SANITY_PROJECT_ID"),
  SANITY_DATASET: z.preprocess(optionalString, z.string().default("production")),
  SANITY_WRITE_TOKEN: requiredString("SANITY_WRITE_TOKEN"),
  SANITY_STUDIO_URL: z.preprocess(optionalString, z.string().optional()),

  MEDUSA_REVALIDATE_SECRET: z.preprocess(optionalString, z.string().optional()),
});

type InferSchema<TSchema extends { parse: (input: unknown) => unknown }> = ReturnType<
  TSchema["parse"]
>;

export type MedusaEnv = InferSchema<typeof envSchema>;

const rawEnv = {
  DATABASE_URL: valueOrBuildDefault("DATABASE_URL"),
  REDIS_URL: process.env["REDIS_URL"],
  ENABLE_EXPLICIT_REDIS_MODULES: process.env["ENABLE_EXPLICIT_REDIS_MODULES"],
  MEDUSA_WORKER_MODE: process.env["MEDUSA_WORKER_MODE"],
  LOG_LEVEL: process.env["LOG_LEVEL"],

  JWT_SECRET: valueOrBuildDefault("JWT_SECRET"),
  COOKIE_SECRET: valueOrBuildDefault("COOKIE_SECRET"),

  STORE_CORS: valueOrBuildDefault("STORE_CORS"),
  ADMIN_CORS: valueOrBuildDefault("ADMIN_CORS"),
  AUTH_CORS: valueOrBuildDefault("AUTH_CORS"),
  MEDUSA_BACKEND_URL: valueOrBuildDefault("MEDUSA_BACKEND_URL"),
  MEDUSA_STOREFRONT_URL: valueOrBuildDefault("MEDUSA_STOREFRONT_URL"),

  STRIPE_API_KEY: valueOrBuildDefault("STRIPE_API_KEY"),
  STRIPE_WEBHOOK_SECRET: valueOrBuildDefault("STRIPE_WEBHOOK_SECRET"),

  POSTHOG_API_KEY: valueOrBuildDefault("POSTHOG_API_KEY"),
  POSTHOG_HOST: process.env["POSTHOG_HOST"],

  KLAVIYO_PRIVATE_API_KEY: process.env["KLAVIYO_PRIVATE_API_KEY"],
  KLAVIYO_PUBLIC_API_KEY: process.env["KLAVIYO_PUBLIC_API_KEY"],

  SHIPPO_API_KEY: process.env["SHIPPO_API_KEY"],
  SHIPPING_LABEL_AUTOPURCHASE: process.env["SHIPPING_LABEL_AUTOPURCHASE"],

  MUX_TOKEN_ID: process.env["MUX_TOKEN_ID"],
  MUX_TOKEN_SECRET: process.env["MUX_TOKEN_SECRET"],

  SANITY_PROJECT_ID: valueOrBuildDefault("SANITY_PROJECT_ID"),
  SANITY_DATASET: process.env["SANITY_DATASET"],
  SANITY_WRITE_TOKEN: valueOrBuildDefault("SANITY_WRITE_TOKEN"),
  SANITY_STUDIO_URL: process.env["SANITY_STUDIO_URL"],

  MEDUSA_REVALIDATE_SECRET: process.env["MEDUSA_REVALIDATE_SECRET"],
};

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid Medusa environment: ${details}`);
}

const env = parsedEnv.data;

const optionalRuntimeWarnings = [
  { key: "KLAVIYO_PRIVATE_API_KEY", consumer: "Agent 23 Klaviyo subscribers" },
  { key: "KLAVIYO_PUBLIC_API_KEY", consumer: "Agent 23 Klaviyo subscribers" },
  { key: "SHIPPO_API_KEY", consumer: "future Shippo label workflows" },
  { key: "MUX_TOKEN_ID", consumer: "future Mux video operations" },
  { key: "MUX_TOKEN_SECRET", consumer: "future Mux video operations" },
  { key: "SANITY_STUDIO_URL", consumer: "future Medusa Admin Sanity links" },
  { key: "MEDUSA_REVALIDATE_SECRET", consumer: "future storefront revalidation subscribers" },
] as const;

if (!isMedusaBuildCommand) {
  for (const warning of optionalRuntimeWarnings) {
    if (!env[warning.key]) {
      process.emitWarning(`${warning.key} is not set; ${warning.consumer} will remain disabled.`, {
        code: "VAIVAE_OPTIONAL_ENV_MISSING",
      });
    }
  }
}

module.exports = { env };
