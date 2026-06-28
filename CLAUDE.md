# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Stirilo is **greenfield**. As of this writing the repo contains only `README.md` and the PRD at `docs/plans/prd.pdf`. The PRD is a strong reference for *what to build* (architecture, schema, milestones, safety model), but it is **not the source of truth for how**. Carlos's conventions (global `~/.claude/CLAUDE.md` + this file) win on any conflict. When the PRD and a convention disagree on something that matters, ask before diverging.

## What Stirilo Is

A self-hosted, local-first system control dashboard for developers. It inspects and reports on the local machine: scan targets (directories), filesystem metadata, Git repositories, sensitive-file markers, and basic system health. It exposes this data through a web UI, an authenticated HTTP API, and (later) an MCP server for AI agents.

The product is **read-only and observational** for v0.1. It does not execute arbitrary commands, edit files, manage the system, or run as root.

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
- **Never commit:** `.env`, `.env.local`, `.env.production`, `*.db`, `*.db-shm`, `*.db-wal`, `*.sqlite`, `*.sqlite3`, `*.pem`, `*.key`, anything under `data/` except `.gitkeep`, real credentials/tokens, or the PRD PDF (`docs/plans/*.pdf` is gitignored on purpose). Commit `.env.example` with placeholder values only.
- A root `.gitignore` must exist before any secret-bearing or generated files are introduced. Until then, only documentation is being committed.
- **Run `gitleaks` before committing** anything that could contain secrets. If gitleaks isn't installed yet, manually scan staged diffs for keys, tokens, passwords, and connection strings.
- If a secret is ever committed, treat the value as compromised: rotate it, then rewrite history (it is not "fixed" by a follow-up deletion commit).
- **Do not push to GitHub** until explicitly told. Work stays local; commit freely, push never (for now).
- Keep commits scoped and conventional (see commit rules below); never bundle a stray secret-bearing file into an unrelated commit.

## Technical Stack

pnpm workspace; Node.js 22+; TypeScript; Next.js (App Router) + Tailwind CSS + shadcn/ui + lucide-react; SQLite via `better-sqlite3` with Drizzle ORM; Zod for validation; React Hook Form; TanStack Query for server state. Testing: Vitest (unit/integration), Playwright (E2E). Secret scanning via gitleaks.

Code style (these override the PRD): **no Prettier.** Carlos's conventions apply, notably braces on their own line (Allman style) for TypeScript/JS, and semicolons. Enforce style via ESLint stylistic rules (e.g. `@stylistic/eslint-plugin`) rather than a formatter. `chore:` is banned as a commit type; use a specific type. No em dashes anywhere.

## Repository Architecture

pnpm monorepo. Capabilities live in `packages/*` so the web app and future MCP server share them:

- `apps/web/` — Next.js app (`app/`, `components/`, `lib/`, `server/`, `public/`).
- `packages/core/` — shared types/utilities.
- `packages/db/` — Drizzle schema, migrations, SQLite connection. Supports `:memory:` for tests.
- `packages/auth/` — single-user local auth; structured so it can migrate from SHA-256 to `argon2id` later.
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

SQLite, no table prefix (DB is dedicated to Stirilo). Tests use `:memory:`. Core tables (see PRD §9 for full DDL): `settings`, `audit_log`, `sessions`, `scan_targets`, `scan_runs`, `git_repositories`, `git_status_snapshots`, `command_runs`, `agent_tokens`. Manage schema/migrations through Drizzle.

## Auth Model (v0.1)

Single-user, env-configured. `STIRILO_USERNAME` + `STIRILO_PASSWORD_SHA256`. On login: validate username, SHA-256 the submitted password, compare with **timing-safe** comparison, create a session, store the session *hash* (not the raw token), set an HTTP-only cookie (`sameSite=lax`, `secure` in production, server-side validation), and write an audit entry. The HTTP API uses a *separate* `STIRILO_AGENT_TOKEN`, distinct from the user session.

## Commands

These are the PRD's target commands; wire them up as the workspace is built:

```
pnpm install
pnpm dev          # start Next.js app (redirects to /login when unauthenticated)
pnpm build
pnpm lint
pnpm typecheck
pnpm test         # Vitest
pnpm test:e2e     # Playwright
pnpm db:generate  # Drizzle migration generation
pnpm db:migrate
pnpm db:studio
pnpm gitleaks     # secret scan
```

Run a single Vitest file: `pnpm test <path>` (or `pnpm vitest run <path> -t "<name>"` for one test).

Before opening any PR, verify: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && gitleaks scan`. CI runs the same chain.

## Implementation Order

Follow the PRD milestones (0–10) in order; do not jump ahead to command execution. Sequence: repo foundation → Next.js shell → SQLite/Drizzle → config validation → auth → audit log → scan-target CRUD → filesystem scanner → Git scanner → dashboard → HTTP API → MCP server → docs → release hardening. The command runner stays design-only until scan, Git, API, auth, and the security model are proven.

## Testing Expectations

Tests are required from the start, not retrofitted. Security-critical units (path validation, sensitive-file detection, redaction, Git remote sanitization, auth hash verification, config validation) must have unit tests. Integration tests use temp directories + in-memory SQLite and **must prove sensitive files are detected without being read**.
