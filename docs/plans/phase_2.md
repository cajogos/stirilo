# Phase 2: SQLite Persistence & Auth

**Status:** Not started
**Depends on:** Phase 1
**PRD reference:** Milestone 2, Implementation Order steps 4-7

## Goal

Real persistence and single-user authentication: a Drizzle-managed SQLite database, validated environment config, working login/logout with sessions, and an audit log.

## In scope

- `packages/db/`: SQLite connection (`better-sqlite3`), Drizzle schema, migrations, `:memory:` support for tests
- Initial tables: `settings`, `sessions`, `audit_log`
- `packages/redaction/` established here (the audit log must never store secrets) and reused by later phases
- Env config validation with Zod (fail fast on missing/invalid config)
- `packages/auth/`: single-user login (`STIRILO_USERNAME` + `STIRILO_PASSWORD_SHA256`), structured to migrate to `argon2id` later
- Session cookie + logout

## Out of scope

- Scan targets, scanner, Git, dashboard data, HTTP API (later phases)

## Deliverables

- [ ] SQLite connection + Drizzle schema + migrations
- [ ] `settings`, `sessions`, `audit_log` tables
- [ ] Zod-validated env config loader
- [ ] Single-user login flow
- [ ] Session cookie + server-side session validation
- [ ] Logout
- [ ] Redaction package with deterministic `[REDACTED]` output
- [ ] `pnpm db:generate` / `pnpm db:migrate` / `pnpm db:studio` wired up

## Acceptance criteria

- [ ] User can log in with configured username/password hash
- [ ] Session persists through refresh
- [ ] Logout clears the session
- [ ] Audit log records login success/failure and logout
- [ ] Tests cover auth (hash verification) and config validation

## Safety notes

- SHA-256 the submitted password; compare with a **timing-safe** comparison.
- Store the session **hash**, never the raw token.
- Cookie: `httpOnly`, `sameSite=lax`, `secure` in production, server-side validation.
- The HTTP API will use a **separate** `STIRILO_AGENT_TOKEN` (Phase 7), distinct from the user session.
- Never expose `process.env` through any route. Never log secrets in the audit log.
- Never commit the database file; `data/` holds only `.gitkeep`.
