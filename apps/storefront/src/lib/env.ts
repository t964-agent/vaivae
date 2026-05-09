import { z } from "zod";

const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const requiredString = z.string().trim().min(1);
const optionalString = z.preprocess(emptyStringToUndefined, z.string().trim().min(1).optional());
const requiredUrl = z.url();
const optionalUrl = z.preprocess(emptyStringToUndefined, z.url().optional());

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_BASE_URL: requiredUrl,
  NEXT_PUBLIC_GTM_ID: optionalString,
  NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY: optionalString,
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: requiredUrl,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: requiredString,
  NEXT_PUBLIC_MUX_ENV_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_HOST: optionalUrl.prefault("https://us.i.posthog.com"),
  NEXT_PUBLIC_POSTHOG_KEY: optionalString,
  NEXT_PUBLIC_SANITY_DATASET: requiredString,
  NEXT_PUBLIC_SANITY_PROJECT_ID: requiredString,
  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requiredString,
  NEXT_PUBLIC_TERMLY_WEBSITE_UUID: optionalString,
});

export const serverEnvSchema = publicEnvSchema.extend({
  MEDUSA_REVALIDATE_SECRET: requiredString,
  REGION_ID: requiredString,
  SANITY_API_READ_TOKEN: optionalString,
  SANITY_REVALIDATE_SECRET: requiredString,
  SENTRY_AUTH_TOKEN: optionalString,
  SENTRY_DSN: optionalUrl,
  SENTRY_ORG: optionalString,
  SENTRY_PROJECT: optionalString.prefault("vaivae-storefront"),
});

function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const name = issue.path.join(".") || "environment";

      return `${name}: ${issue.message}`;
    })
    .join("; ");
}

function parseEnv<TSchema extends z.ZodType>(schema: TSchema, label: string): z.infer<TSchema> {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      `Invalid ${label} storefront environment variables. ${formatEnvError(result.error)}`,
    );
  }

  return result.data;
}

// Client Components must import `publicEnv` only; `env` includes server-only secrets.
export const publicEnv = parseEnv(publicEnvSchema, "public");
export const env = parseEnv(serverEnvSchema, "server");
