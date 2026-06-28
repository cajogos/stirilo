# Phase 16: MCP and API Depth

**Status:** Planned
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

- [ ] MCP tools/resources for at-risk repos, sensitive-file inventory, health trends, and scan diffs.
- [ ] Rate limiting on the HTTP API with the stable error shape on limit.
- [ ] Audit-log export (e.g. JSON/CSV) + retention policy.
- [ ] `argon2id` hashing with a migration path from existing SHA-256 hashes.

## Acceptance criteria

- [ ] MCP tools return redacted, metadata-only data and go through the HTTP API, not the DB.
- [ ] Rate limiting returns `{ "error": { "code", "message", "details" } }` when tripped.
- [ ] Audit export never contains secrets; retention prunes as configured.
- [ ] New logins use `argon2id`; existing SHA-256 credentials still authenticate (or are re-hashed on next login).

## Recommendations / Watch-outs

- Keep MCP tool schemas derived from the same shared Zod source as the API (Phase 11) so they can't drift.
- Rate-limit the agent token and user session independently; they are separate identities.
- For the hash migration, support transparent upgrade-on-login rather than forcing a password reset.

## Safety notes

- **Never expose `process.env`, raw session tokens, or raw agent tokens** through MCP or the API.
- MCP goes through the HTTP API so auth, audit, redaction, and permission checks stay centralized.
- Keep timing-safe comparison for credential checks after the `argon2id` migration.

## Implementation Checklist

1. [ ] Add MCP read-only tools/resources for the new Phase 12-14 data.
2. [ ] Add rate limiting (separate for session vs agent token).
3. [ ] Implement audit-log export + retention.
4. [ ] Migrate auth to `argon2id` with upgrade-on-login; keep timing-safe compare.
5. [ ] Tests: MCP redaction/metadata-only, rate-limit error shape, export contains no secrets, hash upgrade path.

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** an MCP client retrieves at-risk repos and the sensitive-file inventory (redacted, via the API); rate limiting trips with the stable error; a legacy SHA-256 login succeeds and upgrades
- [ ] `git status` + `git diff --staged` reviewed; no secrets staged
- [ ] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Expand MCP coverage and harden the API`
