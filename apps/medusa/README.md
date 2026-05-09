# vaivae Medusa Backend

This app is the Medusa v2 commerce backend for `api.vaivae.com`. Follow the root `AGENTS.md` and `docs/architecture.md` before changing architecture, dependencies, modules, subscribers, or deployment behavior.

## Local Development

1. Copy `apps/medusa/.env.example` to `apps/medusa/.env` and replace placeholders.
2. Start Postgres 16 locally:

```bash
docker run --name vaivae-medusa-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres:16
```

3. Redis is optional locally. To use explicit Redis modules, start Redis and set `ENABLE_EXPLICIT_REDIS_MODULES=true` with `REDIS_URL`:

```bash
docker run --name vaivae-medusa-redis -p 6379:6379 -d redis:7
```

4. Run Medusa:

```bash
pnpm dev
```

## Commands

```bash
pnpm build
pnpm db:migrate
pnpm db:seed
pnpm user:create
```

## Deployment

Medusa Cloud builds this app from `apps/medusa` on `main`; Agent 26 wires CI. Launch+ Cloud environments auto-configure Redis-backed caching, event bus, workflow engine, and locking, so explicit Redis modules stay disabled unless `ENABLE_EXPLICIT_REDIS_MODULES=true` is set for local/self-hosted use.

Stripe webhooks go directly to Medusa at `/hooks/payment/stripe_stripe`. No storefront proxy or custom Medusa route is needed.

Sentry is not wired here yet because `@sentry/node` is not installed in this workspace. Agent 24 should add the exact dependency and Medusa Node instrumentation.
