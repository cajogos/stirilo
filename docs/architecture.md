# Architecture

Stirilo is a pnpm monorepo. Capabilities live in `packages/*` so the web app and
the MCP server can share them.

## Packages

| Package | Responsibility |
| --- | --- |
| `@stirilo/core` | Zod env config loader; scan-path validation (canonicalize + blocklist) |
| `@stirilo/db` | SQLite (better-sqlite3) + Drizzle schema, migrations, audit writer |
| `@stirilo/auth` | argon2id password hashing, sessions, credential verification |
| `@stirilo/redaction` | Deterministic `[REDACTED]` secret-pattern redaction |
| `@stirilo/scanner` | Metadata-only filesystem scanner (never reads file contents) |
| `@stirilo/git` | Git repo detection + status via `execFile`; remote URL sanitization |
| `@stirilo/mcp` | Read-only MCP server that calls the HTTP API |
| `@stirilo/command-runner` | Design only (no implementation in v0.1) |
| `apps/web` | Next.js App Router UI + HTTP API |

## Request flow

```
Browser ──► Next.js middleware (cookie gate) ──► Server Components / Server Actions
                                                      │
AI agent ──► HTTP API (/api/*, bearer token) ─────────┤
                                                      ▼
                                          server services (apps/web/src/server)
                                                      ▼
                                @stirilo/* packages ──► SQLite (Drizzle)

MCP client ──► @stirilo/mcp (stdio) ──► HTTP API (/api/*)
```

## Key rules

- **Centralized security.** Auth, audit logging, redaction, and validation live
  in the server/service layer. The UI, the HTTP API, and the MCP server all go
  through it; the MCP server talks to the API rather than the database directly.
- **Shared services.** Scan-target creation and scan execution are single
  functions (`apps/web/src/server/services/*`) used by both the UI server
  actions and the HTTP API, so logic is never duplicated.
- **Native modules** (`better-sqlite3`, `@node-rs/argon2`) and the server-only
  workspace packages are marked external in the Next.js build so they load from
  `node_modules` at runtime.
- **The database is opened once** as a singleton (`apps/web/src/server/db.ts`),
  which also ensures the data directory exists and applies migrations.

## Data model

SQLite tables (managed by Drizzle migrations): `settings`, `sessions`,
`audit_log`, `scan_targets`, `scan_runs`, `git_repositories`,
`git_status_snapshots`. The `command_runs` and `agent_tokens` tables from the PRD
are planned for later phases.
