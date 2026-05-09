import type { InputConfigModules, ProjectConfigOptions } from "@medusajs/framework/types";
import type * as MedusaUtils from "@medusajs/framework/utils";
import type { MedusaEnv } from "./src/lib/env";

const { defineConfig, loadEnv } = require("@medusajs/framework/utils") as typeof MedusaUtils;
const { env } = require("./src/lib/env") as { env: MedusaEnv };

loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd());

const redisUrl = env.REDIS_URL;

const redisModules: InputConfigModules =
  env.ENABLE_EXPLICIT_REDIS_MODULES && redisUrl
    ? [
        {
          resolve: "@medusajs/medusa/caching",
          options: {
            providers: [
              {
                resolve: "@medusajs/medusa/caching-redis",
                id: "redis",
                options: {
                  redisUrl,
                },
              },
            ],
          },
        },
        {
          resolve: "@medusajs/medusa/event-bus-redis",
          options: {
            redisUrl,
          },
        },
        {
          resolve: "@medusajs/medusa/workflow-engine-redis",
          options: {
            redis: {
              redisUrl,
            },
          },
        },
        {
          resolve: "@medusajs/medusa/locking",
          options: {
            providers: [
              {
                resolve: "@medusajs/medusa/locking-redis",
                id: "redis",
                options: {
                  redisUrl,
                },
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
            apiKey: env.STRIPE_API_KEY,
            webhookSecret: env.STRIPE_WEBHOOK_SECRET,
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
            posthogEventsKey: env.POSTHOG_API_KEY,
            posthogHost: env.POSTHOG_HOST,
          },
        },
      ],
    },
  },
  ...redisModules,
];

const projectConfig: ProjectConfigOptions = {
  databaseUrl: env.DATABASE_URL,
  workerMode: env.MEDUSA_WORKER_MODE,
  http: {
    storeCors: env.STORE_CORS,
    adminCors: env.ADMIN_CORS,
    authCors: env.AUTH_CORS,
    jwtSecret: env.JWT_SECRET,
    cookieSecret: env.COOKIE_SECRET,
  },
};

if (redisUrl) {
  projectConfig.redisUrl = redisUrl;
}

module.exports = defineConfig({
  projectConfig,
  admin: {
    backendUrl: env.MEDUSA_BACKEND_URL,
    storefrontUrl: env.MEDUSA_STOREFRONT_URL,
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
// In production, point Stripe Dashboard -> Webhooks -> endpoint at https://api.vaivae.com/hooks/payment/stripe_stripe.
