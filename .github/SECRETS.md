# GitHub Secrets And Runtime Variables

This repository uses GitHub Actions for CI only. Vercel and Medusa Cloud deploy from their native GitHub integrations, so deployment tokens are not required in GitHub unless that strategy changes.

Never commit real values. Store secrets in GitHub, Vercel, Medusa Cloud, Sanity, Stripe, Klaviyo, Mux, Sentry, and Termly dashboards as appropriate.

## GitHub Actions

Required for CI quality/build workflows:

| Name                                 | Type                | Consumed by         | Notes                                                                     |
| ------------------------------------ | ------------------- | ------------------- | ------------------------------------------------------------------------- |
| `TURBO_TOKEN`                        | Secret              | `ci.yml`            | Optional unless Turborepo remote cache is enabled.                        |
| `TURBO_TEAM`                         | Repository variable | `ci.yml`            | Required with `TURBO_TOKEN`.                                              |
| `NEXT_PUBLIC_BASE_URL`               | Repository variable | `ci.yml`            | Defaults to `https://vaivae.com` for CI-only builds.                      |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL`     | Repository variable | `ci.yml`            | Use preview/staging backend for production-equivalent CI.                 |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Secret or variable  | `ci.yml`            | Browser-safe Medusa key; can be a CI fixture value for non-deploy builds. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`      | Secret or variable  | `ci.yml`            | Required by storefront build; CI has a fallback fixture value.            |
| `NEXT_PUBLIC_SANITY_DATASET`         | Repository variable | `ci.yml`            | Usually `development` for PR/preview and `production` for release checks. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Secret or variable  | `ci.yml`, `e2e.yml` | Browser-safe Stripe publishable key; secret key stays in Medusa Cloud.    |
| `REGION_ID`                          | Repository variable | `ci.yml`            | Storefront single-market Medusa region id.                                |
| `MEDUSA_REVALIDATE_SECRET`           | Secret              | `ci.yml`            | CI can use a non-production fixture value unless testing live webhooks.   |
| `SANITY_REVALIDATE_SECRET`           | Secret              | `ci.yml`, `e2e.yml` | CI can use a non-production fixture value unless testing live webhooks.   |

Required for Sentry source-map upload on `main`:

| Name                        | Type               | Consumed by                 | Notes                                                         |
| --------------------------- | ------------------ | --------------------------- | ------------------------------------------------------------- |
| `SENTRY_AUTH_TOKEN`         | Secret             | `ci.yml` `sourcemap-upload` | Token must have project release/source-map upload access.     |
| `SENTRY_ORG`                | Secret             | `ci.yml` `sourcemap-upload` | Sentry organization slug.                                     |
| `SENTRY_PROJECT_STOREFRONT` | Secret or variable | `ci.yml` `sourcemap-upload` | Defaults to `vaivae-storefront` if omitted.                   |
| `SENTRY_PROJECT_MEDUSA`     | Secret or variable | Future Medusa release jobs  | Documented now for parity; not consumed by current workflows. |

Required for security/performance workflows:

| Name                    | Type                | Consumed by              | Notes                                                                                 |
| ----------------------- | ------------------- | ------------------------ | ------------------------------------------------------------------------------------- |
| `GITLEAKS_LICENSE`      | Secret              | `ci.yml`, `gitleaks.yml` | Required by `gitleaks/gitleaks-action` for some organization/private repositories.    |
| `LHCI_GITHUB_APP_TOKEN` | Secret              | `lighthouse.yml`         | Optional for temporary public storage, required for richer GitHub status integration. |
| `PLAYWRIGHT_BASE_URL`   | Repository variable | `e2e.yml`                | Optional. If omitted, Playwright starts the local storefront dev server.              |

Optional for live integration tests only:

| Name                    | Type   | Consumed by                     | Notes                                                      |
| ----------------------- | ------ | ------------------------------- | ---------------------------------------------------------- |
| `STRIPE_TEST_KEY`       | Secret | Future integration/E2E tests    | Current workflows use mocks or publishable test fixtures.  |
| `KLAVIYO_TEST_KEY`      | Secret | Future integration tests        | Do not use production Klaviyo credentials in CI.           |
| `SANITY_API_READ_TOKEN` | Secret | Future draft/private read tests | Not required by current CI.                                |
| `SANITY_WRITE_TOKEN`    | Secret | Future sync integration tests   | Prefer Medusa Cloud preview env for write-path validation. |

## Vercel Environments

Set these in Vercel for Preview and Production. GitHub Actions does not deploy the storefront.

| Name                                 | Environment         | Notes                                                       |
| ------------------------------------ | ------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_BASE_URL`               | Preview, Production | Canonical origin for metadata and callbacks.                |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL`     | Preview, Production | Store API origin.                                           |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Preview, Production | Storefront publishable key.                                 |
| `REGION_ID`                          | Preview, Production | Phase 1 US/USD region id.                                   |
| `MEDUSA_REVALIDATE_SECRET`           | Preview, Production | Must match Medusa webhook sender.                           |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`      | Preview, Production | Sanity project id.                                          |
| `NEXT_PUBLIC_SANITY_DATASET`         | Preview, Production | `development` for preview, `production` for production.     |
| `SANITY_API_READ_TOKEN`              | Preview, Production | Optional until draft/private reads are enabled.             |
| `SANITY_REVALIDATE_SECRET`           | Preview, Production | Must match Sanity webhook secret.                           |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Preview, Production | Stripe publishable key.                                     |
| `NEXT_PUBLIC_POSTHOG_KEY`            | Preview, Production | Consent-gated analytics.                                    |
| `NEXT_PUBLIC_POSTHOG_HOST`           | Preview, Production | Defaults to `https://us.i.posthog.com`.                     |
| `NEXT_PUBLIC_GTM_ID`                 | Preview, Production | Consent-gated GTM.                                          |
| `NEXT_PUBLIC_TERMLY_WEBSITE_UUID`    | Preview, Production | Termly CMP website UUID.                                    |
| `NEXT_PUBLIC_MUX_ENV_KEY`            | Preview, Production | Mux public environment key.                                 |
| `NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY` | Preview, Production | Klaviyo onsite public key.                                  |
| `SENTRY_DSN`                         | Preview, Production | Server/runtime Sentry DSN.                                  |
| `NEXT_PUBLIC_SENTRY_DSN`             | Preview, Production | Browser Sentry DSN.                                         |
| `SENTRY_AUTH_TOKEN`                  | Preview, Production | Only if Vercel performs source-map upload during its build. |
| `SENTRY_ORG`                         | Preview, Production | Required with `SENTRY_AUTH_TOKEN`.                          |
| `SENTRY_PROJECT`                     | Preview, Production | Storefront Sentry project slug.                             |

Do not set Medusa secret keys, Stripe secret keys, Klaviyo private keys, or Sanity write tokens in Vercel unless a future ADR moves those responsibilities to the storefront.

## Medusa Cloud Environments

Set these in Medusa Cloud for Preview and Production. GitHub Actions does not deploy Medusa.

| Name                         | Environment         | Notes                                                             |
| ---------------------------- | ------------------- | ----------------------------------------------------------------- |
| `JWT_SECRET`                 | Preview, Production | Strong random value per environment.                              |
| `COOKIE_SECRET`              | Preview, Production | Strong random value per environment.                              |
| `STORE_CORS`                 | Preview, Production | Exact storefront origins.                                         |
| `ADMIN_CORS`                 | Preview, Production | Exact admin origins.                                              |
| `AUTH_CORS`                  | Preview, Production | Exact auth origins.                                               |
| `MEDUSA_BACKEND_URL`         | Preview, Production | Public backend/admin origin.                                      |
| `MEDUSA_STOREFRONT_URL`      | Preview, Production | Storefront origin.                                                |
| `STRIPE_API_KEY`             | Preview, Production | Stripe secret key; test mode in preview, live mode in production. |
| `STRIPE_WEBHOOK_SECRET`      | Preview, Production | Stripe webhook signing secret.                                    |
| `POSTHOG_API_KEY`            | Preview, Production | Server-side analytics key.                                        |
| `POSTHOG_HOST`               | Preview, Production | Usually `https://us.i.posthog.com`.                               |
| `SANITY_PROJECT_ID`          | Preview, Production | Sanity project id.                                                |
| `SANITY_DATASET`             | Preview, Production | Dataset used by Medusa-to-Sanity sync.                            |
| `SANITY_WRITE_TOKEN`         | Preview, Production | Server-only Sanity write token.                                   |
| `SANITY_STUDIO_URL`          | Preview, Production | Embedded Studio URL for admin links.                              |
| `KLAVIYO_PRIVATE_KEY`        | Preview, Production | Server-only Klaviyo private key.                                  |
| `KLAVIYO_NEWSLETTER_LIST_ID` | Preview, Production | Klaviyo newsletter list id.                                       |
| `KLAVIYO_WEBHOOK_SECRET`     | Preview, Production | Klaviyo webhook signing secret.                                   |
| `KLAVIYO_PUBLIC_KEY`         | Preview, Production | Public key mirrored for integrations that need it server-side.    |
| `SHIPPO_API_KEY`             | Preview, Production | Shipping label and tracking provider key.                         |
| `MUX_TOKEN_ID`               | Preview, Production | Server-side Mux token id.                                         |
| `MUX_TOKEN_SECRET`           | Preview, Production | Server-side Mux token secret.                                     |
| `MEDUSA_REVALIDATE_SECRET`   | Preview, Production | Must match Vercel storefront secret.                              |
| `SENTRY_DSN`                 | Preview, Production | Medusa Sentry DSN.                                                |
| `SENTRY_ENVIRONMENT`         | Preview, Production | `preview` or `production`.                                        |
| `SENTRY_RELEASE`             | Preview, Production | Release SHA injected by deploy pipeline when available.           |

Medusa Cloud manages `DATABASE_URL`, `REDIS_URL`, `NODE_ENV`, `PORT`, and most infrastructure module wiring. Do not override them unless Medusa Cloud support instructs the team to do so.

## External Platforms

Cloudflare DNS is DNS-only for the storefront and does not require GitHub secrets.

Stripe webhook signing secrets live in Stripe and Medusa Cloud. Sanity webhook secrets live in Sanity and Vercel. Termly and Mux public identifiers are storefront environment variables; their private credentials stay in their vendor dashboards or Medusa Cloud.
