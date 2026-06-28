# Phase 2a: Persistence & Config

**Status:** Done
**Depends on:** Phase 1
**PRD reference:** Milestone 2 (split), Implementation Order steps 4-5

## Goal

Real persistence and validated configuration: a Drizzle-managed SQLite database with migrations and in-memory test support, plus a fail-fast environment config loader. No auth yet (that is Phase 2b).

## In scope

- `packages/db/`: SQLite connection (`better-sqlite3`), Drizzle schema, migrations, `:memory:` support for tests
- Initial `settings` table
- Env config validation with Zod (fail fast on missing/invalid config)
- DB scripts: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`

## Out of scope

- Auth, sessions, audit log, redaction (Phase 2b)
- Scan targets, scanner, Git, dashboard, HTTP API (later phases)

## Deliverables

- [x] SQLite connection + Drizzle schema + migrations
- [x] `settings` table
- [x] Zod-validated env config loader (fail-fast at startup)
- [x] `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` wired up
- [x] `:memory:` database used in tests

## Acceptance criteria

- [x] Migrations create the schema on a fresh DB
- [x] App fails fast with a clear message on missing/invalid env config
- [x] Tests run against in-memory SQLite
- [x] Config validation has unit tests

## Recommendations / Watch-outs

- **Isolate `better-sqlite3` in `packages/db`** and mark it **external** in the Next.js config so the native module is never bundled into a client or edge runtime. This is the most common better-sqlite3 + Next.js failure mode.

## Safety notes

- Never commit the database file; `data/` holds only `.gitkeep`.
- Never expose `process.env` through any route.

## Implementation Checklist

1. [x] Create `packages/db` with a `better-sqlite3` + Drizzle connection
2. [x] Mark `better-sqlite3` external in the Next.js config
3. [x] Define the `settings` table schema
4. [x] Set up drizzle-kit migrations; wire `db:generate` / `db:migrate` / `db:studio`
5. [x] Add `:memory:` database support for tests
6. [x] Add the Zod env config loader (fail-fast at startup)
7. [x] Write unit tests for config validation

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** `pnpm db:generate && pnpm db:migrate && pnpm test` pass; app fails fast on bad env config
- [x] `git status` + `git diff --staged` reviewed; no `.db`/`.sqlite` files or secrets staged
- [x] This file's **Status** changed to `Done`
- [x] Committed locally, no push: `feat: Add SQLite persistence and config validation`
