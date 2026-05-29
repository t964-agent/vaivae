# AGENTS.md

> **Canonical guide for any AI agent (Claude Code, Cursor, Copilot, OpenAI Codex, Aider, opencode, etc.) working in the vaïvae repository.**
>
> Last updated: 2026-05-09. This document is **authoritative**. If any other AI guide file (e.g. `CLAUDE.md`, `.cursor/rules/`) appears to disagree, this file wins. AI guides should be kept in sync — if you change the rules, edit this file and let the others reference it.

---

## 1. The single most important rule

**Read `docs/architecture.md` first.** It is the authoritative architecture document for vaïvae. Every decision below is grounded in that document. If you propose code that contradicts it, you must instead propose an ADR update to `docs/architecture.md` § 20.

Quick links inside `docs/architecture.md`:

- §3.5 — Pinned Dependency Manifest (versions are exact, do not bump)
- §3.5.10 — Excluded packages (do not add)
- §3.5.11 — Critical compatibility gotchas (read these before writing code)
- §4 — Domain model & data ownership rules
- §6 — App architectures (storefront + Medusa)
- §20 — Decision log (ADRs)

---

## 2. Project at a glance

vaïvae is a **luxury editorial fashion ecommerce site** with cinematic storytelling and a small, considered catalog. Phase 1 is DTC, USD, English, single market.

**Stack** (do not deviate without an ADR):

- **Storefront** — Next.js 16 (App Router) on Vercel, TypeScript 6, Tailwind v4, Radix primitives + Motion, RSC-first
- **CMS** — Sanity Studio v5, embedded at `/studio` inside the storefront app
- **Commerce** — Medusa v2 on Medusa Cloud
- **Payments** — Stripe (Payment Element + wallets) via `@medusajs/payment-stripe`
- **Database** — PostgreSQL 16 + Redis 7 (managed by Medusa Cloud)
- **Email** — Medusa Cloud Emails (transactional) + Klaviyo (marketing)
- **Observability** — Sentry, PostHog (via `@medusajs/analytics-posthog`), Vercel Analytics + Speed Insights
- **Compliance** — Termly Pro+ for cookie/CMP, GDPR-equivalent posture globally
- **Backups** — SimpleBackups for off-provider Postgres

**Domains**:

- `vaivae.com` — storefront (Vercel)
- `api.vaivae.com` — Medusa backend (Medusa Cloud)
- DNS: Cloudflare DNS-only (no proxy on Vercel hostnames)

---

## 3. Repository layout

```
vaivae/
├── apps/
│   ├── storefront/        Next.js + embedded Sanity Studio
│   └── medusa/            Medusa v2 backend
├── packages/              Shared workspace packages (currently empty)
├── docs/
│   ├── architecture.md    Source of truth — read this first
│   └── brief/             PDFs from the original brand brief (reference only)
├── _archive/
│   └── prototype-2025-q2/ Original landing page prototype — frozen, not built
├── AGENTS.md              You are here
├── CLAUDE.md              Pointer to AGENTS.md (Claude Code)
├── package.json           Root workspace
├── pnpm-workspace.yaml    pnpm + catalog versions
├── turbo.json             Turborepo task graph
├── tsconfig.base.json     Shared TypeScript baseline
├── .npmrc                 npm/pnpm registry config; pnpm 11 install settings live in pnpm-workspace.yaml
├── .nvmrc                 Node 24.15.0
└── .gitignore
```

Anything inside `_archive/` is **read-only design reference**. Never import from it. Never deploy from it.

---

## 4. Hard rules — do not violate without a new ADR

These are non-negotiable. If a task seems to require breaking one, **stop and ask**.

### 4.1 Versioning

1. **Use exact versions.** No `^`, no `~`, no `latest`. Match what is in `apps/*/package.json` and the `catalog:` references in `pnpm-workspace.yaml`.
2. **Do not upgrade dependencies on your own initiative.** Renovate (or a human) handles upgrades. If you genuinely need a newer version, write an ADR.
3. **Every `@medusajs/*` package must be the same version.** Currently `2.14.2`. Lockstep. Mismatched versions cause silent runtime errors.
4. **`react` and `react-dom` must always match inside each app.** Storefront/shared packages use `catalog:react`; Medusa Admin pins React `18.3.1` to match `@medusajs/dashboard@2.14.2`. The root pins React 19 type packages and `pnpm-workspace.yaml` excludes React types from hidden hoisting so storefront and Admin typechecks do not mix React majors.

### 4.2 Excluded packages — do not install

Per `docs/architecture.md` §3.5.10. Common reflex mistakes to avoid:

| If you'd reach for          | Use instead                                                             |
| --------------------------- | ----------------------------------------------------------------------- |
| `framer-motion`             | `motion@12.38.0` (`import from "motion/react"`)                         |
| `@radix-ui/react-toast`     | `sonner@2.0.7`                                                          |
| `radix-ui` (umbrella)       | Individual `@radix-ui/react-*` primitives                               |
| `autoprefixer`              | Tailwind v4 handles it                                                  |
| `pa11y-ci`                  | `@axe-core/playwright`                                                  |
| `happy-dom`                 | `jsdom`                                                                 |
| `@cloudflare/next-on-pages` | `@opennextjs/cloudflare` (only if Cloudflare path adopted; not Phase 1) |
| `@medusajs/medusa-cli`      | `@medusajs/cli@2.14.2`                                                  |
| `dotenv`                    | Next.js + Medusa load envs natively; Node 24 has `--env-file`           |
| `concurrently`              | Turbo handles task graph                                                |
| `cross-env`                 | Linux-only dev; not needed                                              |
| `jsonwebtoken`              | `jose@6.2.3`                                                            |
| `stripe` (direct in Medusa) | Use `@medusajs/payment-stripe`'s bundled SDK                            |

### 4.3 Next.js 16 gotchas

These break "obvious" assumptions. Get them wrong and CI fails immediately.

1. **`cookies()`, `headers()`, `params`, `searchParams` are async.** Always `await` them.
   ```ts
   // ❌ Wrong
   export default function Page({ params }: { params: { handle: string } }) {
     return <div>{params.handle}</div>;
   }
   // ✅ Right
   export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
     const { handle } = await params;
     return <div>{handle}</div>;
   }
   ```
2. **`middleware.ts` is renamed `proxy.ts`.** Different file name. Note: Medusa Cloud has not validated `proxy.ts` for storefronts hosted there — but our storefront is on Vercel, so this is fine for us.
3. **`revalidateTag(tag)` requires a cache-profile argument** in Next 16. Old single-arg signature is invalid.
4. **`next lint` is removed.** Use `eslint .` directly.
5. **Turbopack is default.** Custom webpack config breaks the build. Use `next build --webpack` only when running `@next/bundle-analyzer`.
6. **`next-sanity` v11 is incompatible with Next 16.** We pin `next-sanity@12.4.5`. Do not downgrade.
7. **Sanity API version is pinned to `2026-03-01`.** Never compute it dynamically with `new Date()`.

### 4.4 Sanity / Studio

1. **Keep `<SanityLive />` and Visual Editing components OUT of the `/studio` layout.** They cause unexpected reloads inside the embedded Studio. Sanity's docs warn about this explicitly.
2. **React Compiler is in `annotation` mode** for the storefront because the embedded Studio is sensitive to over-aggressive memoization. Do not switch to `infer` mode.

### 4.5 Medusa

1. **Medusa Cloud auto-configures Redis** for Caching, Event Bus, Workflow Engine, and Locking on Launch+. Do **not** add module config for these in `medusa-config.ts` on Cloud.
2. **Stripe API version inside Medusa is `2024-04-10`.** Set by `@medusajs/payment-stripe`'s bundled `stripe@^15.5.0`. Do not override the provider's bundled SDK. Custom Stripe code outside the provider may use newer API versions.
3. **Backend Zod must come from `@medusajs/framework/zod`.** Medusa internally pins `zod@4.2.0`. The storefront uses `zod@4.4.3` directly — that's fine because the runtimes don't share a process.
4. **Medusa Cloud storefront builds use Node 24.x.** It cannot be overridden.
5. **Custom modules live inline** in `apps/medusa/src/modules/`. Do not create private npm packages for vaïvae-specific code.
6. **Wishlist** — use `@alphabite/medusa-wishlist@0.5.9` (per ADR-013). Do not write a custom wishlist module.
7. **Email** — use Medusa Cloud Emails for transactional (per ADR-012). Do not add a custom Resend provider unless you write a new ADR justifying it.

### 4.6 Data ownership

`docs/architecture.md` §4.1 has the full source-of-truth map. Critical rules:

1. **Sanity never writes back to Medusa.** Ever. No reverse sync.
2. **Medusa never reads from Sanity to make commerce decisions.** Pricing, inventory, eligibility, fulfillment are computed entirely in Medusa.
3. **Mirrored fields in Sanity are read-only** — editor UI hides or disables them.
4. **No commerce data is duplicated for "performance".** If a price is displayed, it is fetched from Medusa per request, with caching at the storefront layer (not the data layer).

### 4.7 Security

1. **Never commit secrets.** `.env*` files are gitignored except `*.example`.
2. **Never log PII.** Sentry has scrubbing configured; do not bypass it.
3. **Never expose Medusa publishable keys to admin contexts** or admin keys to storefront contexts. Storefront uses `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`; admin operations use server-side workflows.
4. **Authentication** is Medusa-native (per ADR-010). Do not add WorkOS, Clerk, NextAuth, or similar.

---

## 5. Coding conventions

### 5.1 TypeScript

- `strict: true` plus all the extra flags in `tsconfig.base.json` (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, etc.). Loosening any flag requires an ADR.
- Prefer `type` over `interface` for application code; `interface` is fine when extending third-party types.
- **No `any`.** Use `unknown` and narrow.
- **No non-null assertions (`!`).** Either narrow, or refactor to make the type honest.
- Imports always typed: `import { type Foo } from "..."` when only used as a type, due to `verbatimModuleSyntax`.

### 5.2 React (storefront)

- **RSC-first.** Default to Server Components. Add `"use client"` only when needed (interactivity, hooks, Browser APIs).
- **No mixing data fetching with client state.** RSC fetches; Client Components receive props.
- **No `useEffect` for data fetching.** Use RSCs or Server Actions.
- **Forms** — `react-hook-form` + `zod` resolver, in Client Components. Server Actions handle submission.
- **Animations** — `motion/react` for component-level transitions. GSAP + Lenis for scroll-driven cinematic sequences (only on the home page and select editorial pages).
- **State** — Zustand for cart and ephemeral UI state (per-request stores via provider). `nuqs` for URL-state filters/sort. Never read/write Zustand from RSCs.
- **Styles** — Tailwind v4 with `@theme` tokens for brand. `clsx` + `tailwind-merge` (via a `cn()` helper). No CSS-in-JS in the storefront app code (Sanity Studio uses styled-components internally — that's fine, it's their dep).

### 5.3 Medusa (backend)

- Modules go in `apps/medusa/src/modules/<name>/`. Each is a Medusa v2 module with its own models, migrations, services.
- Subscribers in `apps/medusa/src/subscribers/`. They are how cross-cutting concerns react to events.
- Workflows in `apps/medusa/src/workflows/`. Use them for multi-step operations that need compensation.
- Custom API routes in `apps/medusa/src/api/`.
- Admin extensions in `apps/medusa/src/admin/`.
- **All custom code lives inline in the app**, not as private packages.

### 5.4 File naming

- `kebab-case` for files.
- `PascalCase` for React component file names: `ProductCard.tsx`.
- Test files: `*.test.ts` (unit), `*.spec.ts` (rare integration), `*.e2e.ts` (Playwright).

### 5.5 Comments

- Prefer code that doesn't need comments. Use clear names.
- When a comment is needed, explain **why**, not what.
- TSDoc on public APIs (exported functions, hooks, components used across boundaries).

### 5.6 Errors

- Throw `Error` subclasses with meaningful names (`ProductNotFoundError`, etc.).
- Server-side: log with `pino` (Medusa) or Sentry context (storefront). Never `console.log` in committed code except in dev scripts.
- Client-side: surface user-facing errors via `sonner` toasts; report to Sentry.

---

## 6. Workflow when you start a task

1. **Read the task carefully.** Quote requirements back if unclear.
2. **Read `docs/architecture.md`** for relevant sections. Use the table of contents.
3. **Plan with TodoWrite** if the task has 3+ steps.
4. **Search before writing.** Use Grep / Glob / Read to find existing patterns. Match them.
5. **Implement.** Edit existing files when possible. Avoid creating new files unless necessary.
6. **Verify.**
   - Run `pnpm typecheck` (or `pnpm --filter <pkg> typecheck`)
   - Run `pnpm lint`
   - Run relevant tests
7. **Summarize what changed**, including file paths with line numbers (e.g. `src/components/Cart.tsx:142`).

---

## 7. Verification commands

When you finish a change, run **at minimum**:

```bash
# From the repo root
pnpm typecheck
pnpm lint
```

When changing storefront code:

```bash
pnpm --filter @vaivae/storefront typecheck
pnpm --filter @vaivae/storefront test
pnpm --filter @vaivae/storefront build  # only if you suspect build-time issues
```

When changing Medusa code:

```bash
pnpm --filter @vaivae/medusa typecheck
pnpm --filter @vaivae/medusa test
```

E2E tests (`@playwright/test`) and Lighthouse CI (`@lhci/cli`) run in CI; you do not need to run them locally for every change.

---

## 8. Things you must NOT do

A non-exhaustive list, distilled from past mistakes and the architecture doc:

- ❌ Do not add new dependencies without checking §3.5 of `docs/architecture.md`.
- ❌ Do not bump any pinned version. If a bump is needed, write an ADR.
- ❌ Do not add `^` or `~` to versions.
- ❌ Do not write a custom wishlist module — use `@alphabite/medusa-wishlist`.
- ❌ Do not write a custom Resend email provider — use Medusa Cloud Emails.
- ❌ Do not import from `framer-motion` — use `motion/react`.
- ❌ Do not add `<SanityLive />` to `/studio` layouts.
- ❌ Do not synchronously call `cookies()`/`headers()`/`params`/`searchParams` in Next 16.
- ❌ Do not override `@medusajs/payment-stripe`'s bundled Stripe SDK.
- ❌ Do not duplicate commerce data into Sanity for "performance".
- ❌ Do not write custom auth (WorkOS / Clerk / NextAuth). Medusa-native auth only.
- ❌ Do not deploy from `_archive/`. Do not import from it. Do not edit it.
- ❌ Do not commit `.env*` files (except `*.example`).
- ❌ Do not push to `main` directly — open a PR.
- ❌ Do not run `git config`, `git push --force` (except where a hook explicitly requires it), or other destructive git operations without explicit human approval.

---

## 9. When you genuinely need to deviate

Sometimes the architecture needs to evolve. The path is:

1. **Stop coding.**
2. Open `docs/architecture.md` and read § 20 (Decision Log).
3. Draft a new ADR — copy the template at the bottom of § 20. Number it `ADR-016` (or next available).
4. Articulate the **context, decision, alternatives considered, consequences**, and what existing ADRs (if any) it supersedes.
5. Update relevant sections of the document so it stays internally consistent.
6. Mention the ADR in your PR description and ping a human reviewer.

Do not silently violate the architecture and leave the doc out of date. The doc is the contract.

---

## 10. Feedback loop

If something in the architecture is **ambiguous, contradictory, or missing**, fix the architecture document. Do not make ad-hoc decisions in code that the doc doesn't sanction.

If something in **this AGENTS.md is wrong**, edit it. This file is the rulebook for AI agents — keep it accurate.

---

## 11. House style — short notes

- **Brand name** in prose: `vaïvae` (with umlaut). In code, paths, and identifiers: `vaivae` (no umlaut, no diacritics — easier across tools).
- **Tone of voice** in copy: editorial, restrained, confident. Avoid promotional / discount language. Italics on key words for emphasis (`<em>living</em>`).
- **Currency / market** Phase 1: USD only, US only.
- **Languages** Phase 1: English only. Schemas should be i18n-ready but only English content is authored.

---

## 12. Where things live (cheat sheet)

| You want to…               | Look in / edit                                               |
| -------------------------- | ------------------------------------------------------------ |
| Add a storefront page      | `apps/storefront/src/app/`                                   |
| Add a Medusa module        | `apps/medusa/src/modules/<name>/`                            |
| Add a Sanity schema type   | `apps/storefront/src/sanity/schemas/`                        |
| Add a Server Action        | `apps/storefront/src/app/.../actions.ts`                     |
| Add an API route (Next)    | `apps/storefront/src/app/api/.../route.ts`                   |
| Add an API route (Medusa)  | `apps/medusa/src/api/.../route.ts`                           |
| Add a Medusa workflow      | `apps/medusa/src/workflows/<name>/`                          |
| Add a Medusa subscriber    | `apps/medusa/src/subscribers/<name>.ts`                      |
| Add a Medusa admin widget  | `apps/medusa/src/admin/widgets/`                             |
| Add a Medusa admin route   | `apps/medusa/src/admin/routes/`                              |
| Add a UI primitive wrapper | `apps/storefront/src/components/ui/`                         |
| Add a brand component      | `apps/storefront/src/components/`                            |
| Add design tokens          | `apps/storefront/src/styles/globals.css` (`@theme`)          |
| Update architecture        | `docs/architecture.md` (and write an ADR if it's a decision) |

## 13. Local secrets and the Sanity write token

Some scripts need credentials that **do not** belong in Vercel (because the
runtime storefront only reads from Sanity). The canonical location for these
is `apps/storefront/.env.local` (gitignored, `0600` perms).

The two most common cases:

1. **`pnpm sanity:seed`** — needs `SANITY_WRITE_TOKEN`. The script is wired
   to auto-load `.env.local` via `tsx --env-file-if-exists=.env.local`, so
   you do not need to `export` anything. Just put the value in the file.
2. **Local dev against the Cloud Medusa backend** — pull the public env from
   Vercel once and merge into `.env.local`:
   ```bash
   pnpm vercel env pull --environment=development apps/storefront/.env.local
   ```
   Then add `SANITY_WRITE_TOKEN` separately (Vercel does not store it).

### Creating a write token (correct way, with required project membership)

A common failure mode: a token is created at the organisation level but the
owning user has no role on the project, producing a `projectUserNotFoundError`
(HTTP 401) at the first mutation. To avoid that:

1. Go to `https://www.sanity.io/manage/project/<project-id>/api` →
   **Add API token**.
2. Name it `vaivae-seed` (or similar).
3. **Permissions: Editor** (Developer is fine too if schema migrations are
   in scope). Viewer is not enough.
4. Copy the `sk...` value into `apps/storefront/.env.local` as
   `SANITY_WRITE_TOKEN=<value>`. Never commit it. Rotate at the same URL
   if it ever leaks.

The project id and dataset for vaïvae production are:
`NEXT_PUBLIC_SANITY_PROJECT_ID=cwzckel4` and
`NEXT_PUBLIC_SANITY_DATASET=production`. Both can also be pulled with the
`vercel env pull` command above.

### Verifying a token before running destructive operations

```bash
node --env-file=apps/storefront/.env.local --input-type=module -e '
import { createClient } from "@sanity/client";
const c = createClient({
  apiVersion: "2026-03-01",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});
console.log(await c.fetch("*[_id == \"siteSettings\"][0]._id"));
'
```

A successful run prints `siteSettings`. A `projectUserNotFoundError` means
the token's owner needs to be added to the project (see above).

---

## 14. Final reminders

- Be **decisive**. The architecture is detailed enough that you should rarely need to ask "what stack?" questions. If you do need to ask, point at the section of the doc that is unclear so the human can fix it.
- Be **concise** in PR descriptions and chat replies. Reference file paths with line numbers (e.g. `apps/storefront/src/lib/medusa.ts:42`).
- Match **existing patterns** before inventing new ones. The codebase grows in style by accretion.
- When in doubt, **read the architecture doc**. Then ask.
