# CLAUDE.md

> This file is the entry point for **Claude Code** working in the vaïvae repository.
>
> **All instructions live in [`AGENTS.md`](./AGENTS.md).** Claude Code reads this file by default; it is intentionally thin so the rules stay in one place.

---

## Read these, in order:

1. **[`AGENTS.md`](./AGENTS.md)** — universal AI-agent rules for this repo (must read).
2. **[`docs/architecture.md`](./docs/architecture.md)** — authoritative architecture document (must read for any non-trivial change).

If you're about to write code without having read at least the relevant sections of `docs/architecture.md`, **stop**. Read first.

---

## Claude-Code-specific notes

- Use the `TodoWrite` tool for any task with three or more steps.
- Prefer the `Edit` tool over `Write` when modifying existing files. Avoid creating new files unless the task requires it.
- Use `Task` (the agent dispatcher) for open-ended exploration ("how does X work in this codebase?") rather than running many `Grep`/`Glob` calls in the main thread.
- Reference file paths with line numbers in your final summary, e.g. `apps/storefront/src/lib/medusa.ts:42`.
- Never run destructive git commands without explicit user approval (`push --force`, `reset --hard`, `clean -fd`, etc.).
- Never run `git config`. Never amend commits unless the user explicitly asked.

Everything else — versioning rules, excluded packages, Next 16 gotchas, Medusa rules, Sanity rules, code style — is in [`AGENTS.md`](./AGENTS.md). Keep that file as the single source of truth.
