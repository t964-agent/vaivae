# vaïvae

> Luxury editorial fashion ecommerce. Cinematic storytelling, a small considered catalog, sharp engineering.

[![Architecture](https://img.shields.io/badge/architecture-docs%2Farchitecture.md-blue)](./docs/architecture.md)
[![Agents](https://img.shields.io/badge/AI%20agents-AGENTS.md-blue)](./AGENTS.md)
[![Node](https://img.shields.io/badge/node-24.15.0-339933)](./.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-11.0.9-orange)](./package.json)

---

## What this is

vaïvae is being built as a Direct-to-Consumer ecommerce experience for a new luxury fashion house launching with **Drop 01 — May 2026**. Phase 1 is US-only, USD, English. Phase 2+ will expand internationally.

The site is **not** a generic shop. It is a slow, cinematic editorial that resolves into a buyable collection — closer to a fashion film than a commerce template.

## Stack

| Concern       | Tool                                                                                   |
| ------------- | -------------------------------------------------------------------------------------- |
| Storefront    | Next.js 16 (App Router), TypeScript 6, Tailwind v4, Radix + Motion, deployed on Vercel |
| CMS           | Sanity Studio v5, embedded at `/studio` inside the storefront                          |
| Commerce      | Medusa v2 on Medusa Cloud                                                              |
| Payments      | Stripe Payment Element + wallets via `@medusajs/payment-stripe`                        |
| Email         | Medusa Cloud Emails (transactional) + Klaviyo (marketing)                              |
| Database      | PostgreSQL 16 + Redis 7 (managed by Medusa Cloud)                                      |
| Observability | Sentry, PostHog, Vercel Analytics + Speed Insights                                     |
| Compliance    | Termly Pro+                                                                            |
| Backups       | SimpleBackups (off-provider Postgres)                                                  |

The full versioned dependency manifest lives in [`docs/architecture.md` § 3.5](./docs/architecture.md). All package versions are exact; upgrades require an ADR.

## Repository layout

```
vaivae/
├── apps/
│   ├── storefront/        Next.js + embedded Sanity Studio
│   └── medusa/            Medusa v2 backend
├── packages/              Shared workspace packages (currently empty)
├── docs/
│   ├── architecture.md    Single source of truth — read this first
│   └── brief/             Original brand brief PDFs (reference)
├── _archive/
│   └── prototype-2025-q2/ Original landing-page prototype (frozen, design reference)
├── AGENTS.md              Rules for any AI agent working in this repo
├── CLAUDE.md              Pointer to AGENTS.md for Claude Code
└── package.json           pnpm + Turbo workspace root
```

## Getting started

### Prerequisites

- **Node.js 24.15.0** (`nvm install` reads `.nvmrc`)
- **pnpm 11.0.9** (`corepack enable && corepack prepare pnpm@11.0.9 --activate`)
- **PostgreSQL 16** + **Redis 7** locally (or Medusa Cloud for the backend)

### Install

```bash
pnpm install
```

### Run everything in dev

```bash
pnpm dev
```

This runs the storefront and the Medusa backend in parallel via Turbo.

### Run a single workspace

```bash
pnpm --filter @vaivae/storefront dev
pnpm --filter @vaivae/medusa dev
```

### Verify a change

```bash
pnpm typecheck
pnpm lint
```

See `AGENTS.md § 7` for the full verification checklist.

## Testing

```bash
pnpm test
pnpm test:coverage
pnpm test:e2e
```

`pnpm test` runs the root Vitest workspace across storefront and Medusa unit/component tests. Storefront tests use Testing Library with `jsdom`; Medusa unit tests run in the Node environment with external services mocked.

`pnpm test:e2e` runs Playwright specs from `e2e/`. Local browser execution is skipped unless `PLAYWRIGHT_INSTALLED=1` is set.

Use `*.test.ts` / `*.test.tsx` for unit and component tests. Use `e2e/*.spec.ts` for Playwright smoke and accessibility tests.

## Documentation

- **[`docs/architecture.md`](./docs/architecture.md)** — authoritative architecture doc (21 sections, 15 ADRs). Start here for anything non-trivial.
- **[`AGENTS.md`](./AGENTS.md)** — universal rules for AI agents (Claude Code, Cursor, Copilot, etc.).
- **[`CLAUDE.md`](./CLAUDE.md)** — Claude-Code-specific entry point (thin pointer to `AGENTS.md`).
- **[`docs/brief/`](./docs/brief/)** — original brand brief PDFs.

## Domains

| Host             | Purpose        | Provider     |
| ---------------- | -------------- | ------------ |
| `vaivae.com`     | Storefront     | Vercel       |
| `api.vaivae.com` | Medusa backend | Medusa Cloud |

DNS is managed in Cloudflare in DNS-only mode (no proxy on Vercel hostnames per Vercel's recommendation).

## Contributing

- Read `AGENTS.md` first if you (or your AI agent) are about to write code.
- Open a PR against `main`. No direct pushes.
- All changes must pass `pnpm typecheck`, `pnpm lint`, and the relevant test suites.
- Architectural changes require a new ADR in `docs/architecture.md § 20`.

### Local hooks and secret scanning

Husky runs `lint-staged`, commitlint, and a staged `gitleaks` scan before commits. `gitleaks` is a binary, not an npm package, so install it separately:

```bash
brew install gitleaks
```

On Linux, use Linuxbrew or download the `v8.30.1` release archive from GitHub, verify the checksum, and install the `gitleaks` binary somewhere on your `PATH`.

If `gitleaks` is missing locally, the pre-commit hook warns and continues so contributors are not blocked by a missing binary. CI must still enforce `gitleaks` on every PR.

## License

UNLICENSED — proprietary to vaïvae.
