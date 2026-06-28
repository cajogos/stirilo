# Phase 2a: Persistence & Config

**Status:** Not started
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

- [ ] SQLite connection + Drizzle schema + migrations
- [ ] `settings` table
- [ ] Zod-validated env config loader (fail-fast at startup)
- [ ] `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` wired up
- [ ] `:memory:` database used in tests

## Acceptance criteria

- [ ] Migrations create the schema on a fresh DB
- [ ] App fails fast with a clear message on missing/invalid env config
- [ ] Tests run against in-memory SQLite
- [ ] Config validation has unit tests

## Recommendations / Watch-outs

- **Isolate `better-sqlite3` in `packages/db`** and mark it **external** in the Next.js config so the native module is never bundled into a client or edge runtime. This is the most common better-sqlite3 + Next.js failure mode.

## Safety notes

- Never commit the database file; `data/` holds only `.gitkeep`.
- Never expose `process.env` through any route.
