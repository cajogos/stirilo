# Phase 16: MCP and API Depth

**Status:** Done (argon2id already in place; no SHA-256 migration needed)
**Depends on:** Phases 12-15 (exposes the new data they produce)
**PRD reference:** Beyond PRD v0.1 (roadmap); extends Phase 8 (MCP)

## Goal

Expose the new insight surfaces to AI agents through MCP and harden the HTTP API that everything flows through, keeping auth/audit/redaction/permission checks centralized.

## In scope

- **MCP read-only tools/resources** for the new data: at-risk repos (Phase 13), sensitive-file inventory (Phase 12), health trends and scan diffs (Phase 14).
- **API hardening:** rate limiting on the HTTP API, audit-log export with a retention policy.
- **Auth upgrade:** migrate the password hash from SHA-256 to `argon2id` (the auth package is already structured for this).

## Out of scope

- Any write/mutating MCP tool (MCP stays read-only and talks to the HTTP API, not the DB).
- Multi-user auth.

## Deliverables

- [x] MCP tools for at-risk repos, sensitive inventory, disk, duplicates, projects, health trends, and scan diffs (7 new tools).
- [x] Rate limiting on the HTTP API (per token hash) returning the stable error shape with 429.
- [x] Audit-log export (JSON + CSV, redacted) + configurable audit retention.
- [x] `argon2id` hashing - ALREADY the implemented hasher (`@node-rs/argon2`); there is no SHA-256 in use to migrate.

## Acceptance criteria

- [x] MCP tools go through the HTTP API (not the DB); responses are the API's redacted, metadata-only JSON.
- [x] Rate limiting returns `{ "error": { "code": "RATE_LIMITED", ... } }` with HTTP 429 when tripped.
- [x] Audit export is passed through redaction and carries no secrets; audit retention prunes per its own window.
- [x] Logins use `argon2id` with timing-safe comparison (already the case; no legacy SHA-256 path exists).

## Recommendations / Watch-outs

- Keep MCP tool schemas derived from the same shared Zod source as the API (Phase 11) so they can't drift.
- Rate-limit the agent token and user session independently; they are separate identities.
- For the hash migration, support transparent upgrade-on-login rather than forcing a password reset.

## Safety notes

- **Never expose `process.env`, raw session tokens, or raw agent tokens** through MCP or the API.
- MCP goes through the HTTP API so auth, audit, redaction, and permission checks stay centralized.
- Keep timing-safe comparison for credential checks after the `argon2id` migration.

## Implementation Checklist

1. [x] Add 7 MCP read-only tools for the Phase 12-14 data; add `/api/health/trends`.
2. [x] Add token-keyed rate limiting (pure `hitRateLimit` in core) in `requireAgent`; sessions are not agent-rate-limited.
3. [x] Implement `/api/audit-log/export` (JSON/CSV, redacted) + audit retention setting + pruning.
4. [x] Confirm argon2id + timing-safe compare already in place (no migration required).
5. [x] Tests: core unit tests for rate-limit; MCP tool-name coverage; e2e for export (no secret leak), health trends, cron tick auth.

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** MCP tools resolve the new API routes; e2e proves export/trends endpoints work and the export does not leak the agent token; rate-limit logic unit-tested; lint + typecheck + 68 unit + 20 e2e pass
- [x] `git status` + `git diff --staged` reviewed; no secrets staged
- [x] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Expand MCP coverage and harden the API`

> Note: the argon2id deliverable was already satisfied by the existing auth
> package (the PRD's interim SHA-256 was superseded before v0.1 shipped), so the
> "upgrade-on-login" path is not applicable - there are no SHA-256 hashes to
> migrate. Rate limiting is keyed by the agent token hash; user sessions use a
> separate auth path and are not subject to the agent limiter.
