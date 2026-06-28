# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Stirilo v0.1 plus the post-v0.1 roadmap (originally tracked as phases 11-16) are **built, verified, and pushed**; CI is green on `main`. What shipped is recorded in [`CHANGELOG.md`](CHANGELOG.md). Current capabilities: filesystem scanning, sensitive-file detection, scan-insight reports (disk reclamation, duplicate candidates, project inventory), Git status + a cross-repo at-risk dashboard with an opt-in fetch, scan history/diffs and health trends, interval scheduling with redacted webhook alerts, a single-page web UI, an authenticated HTTP API (rate-limited, with a generated OpenAPI contract), and a read-only MCP server. The PRD at `docs/prd.pdf` (gitignored) remains a reference for *what* the product is (architecture, schema, safety model), but it is **not the source of truth for how**. Carlos's conventions (global `~/.claude/CLAUDE.md` + this file) win on any conflict. When the PRD and a convention disagree on something that matters, ask before diverging.

The product stays **read-only and observational**: it does not execute arbitrary commands, edit files, manage the system, or run as root.

## What Stirilo Is

A self-hosted, local-first system control dashboard for developers. It inspects and reports on the local machine: scan targets (directories), filesystem metadata, Git repositories, sensitive-file markers, and basic system health. It exposes this data through a web UI, an authenticated HTTP API, and a read-only MCP server for AI agents.

The product is **read-only and observational**. It does not execute arbitrary commands, edit files, manage the system, or run as root.

## Non-Negotiable Safety Invariants

These come directly from the PRD and override convenience. Violating any of these is a defect:

- **Never read, ingest, display, log, or store secret file contents.** Sensitive files (`.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa`, `id_ed25519`, `*.p12`, `*.pfx`, `*.kdbx`, secret-bearing `*.sqlite`/`*.db`) are *detected by metadata only*: path, size, modified time, detection rule. Never open them.
- **Never expose `process.env`, raw session tokens, or raw agent tokens through the API or UI.**
- **Never commit secrets or database files.** `.env*`, `*.db`, `*.db-shm`, `*.db-wal`, `*.sqlite`, `*.sqlite3`, `*.pem`, `*.key` must stay gitignored. Provide `.env.example` only.
- **Sanitize Git remote URLs** before storing/displaying: strip embedded credentials (e.g. `https://token@host/...` and `https://user:pass@host/...`). Never store access tokens or passwords from remotes.
- **No arbitrary shell execution** in v0.1. The command runner is design-only (docs) until the scan/Git/API/auth/security model is solid.
- **App must never run as root** and must not require sudo for any v0.1 feature.
- **Default bind address is `127.0.0.1`.** LAN access only via explicit config, never by default.
- **Redact** common secret patterns (Bearer/GitHub/OpenAI/AWS/Supabase keys, JWTs, DB URLs with passwords, private-key blocks, `password=`/`token=`/`api_key=`/`secret=`) from logs, command outputs, API responses, and stored metadata. Redaction output is the deterministic literal `[REDACTED]`.
- **Do not run Git hooks** as part of scanning. Prefer Git CLI with safe argument arrays, never shell strings.

When in doubt about whether something touches secrets, choose the path that reads less.

## Git Hygiene & History Safety

Secrets that reach git history are effectively permanent, so prevent them at commit time rather than scrubbing later.

- **Never `git add -A` / `git add .` blindly.** Stage explicit paths. Inspect `git status` and `git diff --staged` before every commit.
- **Never commit:** `.env`, `.env.local`, `.env.production`, `*.db`, `*.db-shm`, `*.db-wal`, `*.sqlite`, `*.sqlite3`, `*.pem`, `*.key`, anything under `data/` except `.gitkeep`, real credentials/tokens, or the PRD PDF (`*.pdf` is gitignored on purpose; the PRD lives at `docs/prd.pdf`). Commit `.env.example` with placeholder values only.
- A root `.gitignore` must exist before any secret-bearing or generated files are introduced. Until then, only documentation is being committed.
- **Run `gitleaks` before committing** anything that could contain secrets. If gitleaks isn't installed yet, manually scan staged diffs for keys, tokens, passwords, and connection strings.
- If a secret is ever committed, treat the value as compromised: rotate it, then rewrite history (it is not "fixed" by a follow-up deletion commit).
- **Push only when explicitly asked.** The repo is published at `github.com:cajogos/stirilo`; `main` is pushed and CI runs the verification chain on push. Commit freely; push only on request and only after `pnpm lint && pnpm typecheck && pnpm test && pnpm build && gitleaks dir .` passes.
- Keep commits scoped and conventional (see commit rules below); never bundle a stray secret-bearing file into an unrelated commit.

## Technical Stack

pnpm workspace; Node.js 22+; TypeScript; Next.js (App Router) + Tailwind CSS + shadcn/ui + lucide-react; SQLite via `better-sqlite3` with Drizzle ORM; Zod for validation; React Hook Form; TanStack Query for server state. Testing: Vitest (unit/integration), Playwright (E2E). Secret scanning via gitleaks.

Code style (these override the PRD): **no Prettier.** Carlos's conventions apply, notably braces on their own line (Allman style) for TypeScript/JS, and semicolons. Enforce style via ESLint stylistic rules (e.g. `@stylistic/eslint-plugin`) rather than a formatter. `chore:` is banned as a commit type; use a specific type. No em dashes anywhere.

## Repository Architecture

pnpm monorepo. Capabilities live in `packages/*` so the web app and MCP server share them:

- `apps/web/` — Next.js app (`app/`, `components/`, `lib/`, `server/`, `public/`).
- `packages/core/` — shared types/utilities.
- `packages/db/` — Drizzle schema, migrations, SQLite connection. Supports `:memory:` for tests.
- `packages/auth/` — single-user local auth; uses `argon2id` (`@node-rs/argon2`) with timing-safe comparison.
- `packages/git/` — Git repo detection + status snapshots, remote URL sanitization.
- `packages/scanner/` — filesystem scanner (metadata only), sensitive-file detection, package/project detection.
- `packages/redaction/` — secret-pattern redaction used everywhere outputs are produced.
- `packages/mcp/` — MCP server (built last). **Talks to the Stirilo HTTP API, not the DB directly**, so auth/audit/redaction/permission checks stay centralized.
- `packages/command-runner/` — design/docs only for v0.1.
- `data/` — local DB lives here in dev (`./data/stirilo.dev.db`); only `.gitkeep` is committed.

### Architectural rules

- Centralize auth, audit logging, redaction, and permission checks in one layer (the HTTP API / server). Downstream consumers (UI, MCP) go through it rather than reaching into the DB.
- All API inputs validated with Zod. API returns JSON with a stable error shape: `{ "error": { "code", "message", "details" } }`.
- Mutating actions write to the audit log. Audit entries: actor, action, target_type, target_id, metadata_json, timestamp. **Never log secrets.**
- Scan target paths are validated (must exist, be a readable directory) and checked against a blocklist. Blocked by default: `/`, `~/.ssh`, `~/.gnupg`, `/proc`, `/sys`, `/dev`, `/run`, `/tmp`. Allowed only with explicit confirmation: `/etc`, `/var/log`, `/srv`, `/opt`, `/home/*`.

## Database

SQLite, no table prefix (DB is dedicated to Stirilo). Tests use `:memory:`. The schema is the source of truth (`packages/db/src/schema.ts`); current tables: `settings`, `audit_log`, `sessions`, `scan_targets`, `scan_runs`, `git_repositories`, `git_status_snapshots`, `health_snapshots`, `schedules`. Manage schema/migrations through Drizzle (`pnpm db:generate` then `pnpm db:migrate`; migrations live in `packages/db/drizzle/`).

## Auth Model

Single-user, env-configured. `STIRILO_USERNAME` + `STIRILO_PASSWORD_HASH` (an `argon2id` hash; generate via `pnpm setup` or `pnpm hash:password`). On login: validate username, verify the password against the argon2id hash with **timing-safe** comparison, create a session, store the session *hash* (not the raw token), set an HTTP-only cookie (`sameSite=lax`, `secure` in production, server-side validation), and write an audit entry. The HTTP API uses a *separate* `STIRILO_AGENT_TOKEN`, distinct from the user session, and is rate-limited per token.

## Commands

```
pnpm install
pnpm setup        # interactive: write credentials + session secret to .env
pnpm dev          # start Next.js app (redirects to /login when unauthenticated)
pnpm build
pnpm lint
pnpm typecheck
pnpm test         # Vitest
pnpm test:e2e     # Playwright
pnpm docs:api     # regenerate docs/api.md + docs/openapi.json from the Zod contract
pnpm db:generate  # Drizzle migration generation
pnpm db:migrate
pnpm db:studio
pnpm hash:password # argon2id-hash a password read from stdin
```

Run a single Vitest file: `pnpm test <path>` (or `pnpm vitest run <path> -t "<name>"` for one test). gitleaks is run via lefthook on staged files (`gitleaks git --staged`) and as `gitleaks dir .` for a full scan; there is no `pnpm gitleaks` script.

Before opening any PR, verify: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && gitleaks dir .`. CI runs the same chain. A full `gitleaks dir .` after a build flags only the local gitignored `.env`; build outputs are allowlisted in `.gitleaks.toml`.

## API Contract

The HTTP API is defined once in `packages/core/src/api-contract.ts` (route registry + Zod request/param schemas). `pnpm docs:api` regenerates `docs/api.md` and `docs/openapi.json` from it; the web route validation and MCP `id` param derive from the same source, so they cannot drift. Add new routes to that registry and regenerate.

## Verification builds

`pnpm build` / `pnpm test:e2e` honour `STIRILO_DIST_DIR` (e2e uses `.next-verify`) so verification never corrupts a running `pnpm dev`'s `.next`. When committing after a Next build, revert its churn to `apps/web/next-env.d.ts` and `apps/web/tsconfig.json`.

## Scheduling

Schedules are interval-based and run when `POST /api/cron/tick` is called (agent token; no browser session) - point a system cron at it. There is no in-process timer (Next bundles `instrumentation.ts` for the edge runtime, which cannot load `better-sqlite3`).

## Testing Expectations

Tests are required from the start, not retrofitted. Security-critical units (path validation, sensitive-file detection, redaction, Git remote sanitization, auth hash verification, config validation) must have unit tests. Integration tests use temp directories + in-memory SQLite and **must prove sensitive files are detected without being read**.
