# Phase 2b: Auth, Audit & Redaction

**Status:** Not started
**Depends on:** Phase 2a
**PRD reference:** Milestone 2 (split), Implementation Order steps 6-7

## Goal

Single-user authentication with sessions and logout, an audit log, and the shared redaction package. Replaces the Phase 1 stubbed auth seam with real session validation.

## In scope

- `sessions` and `audit_log` tables
- `packages/auth/`: single-user login (`STIRILO_USERNAME` + configured password hash), session cookie, logout
- `packages/redaction/` (the audit log must never store secrets); reused by later phases
- Wire the Phase 1 middleware redirect to real server-side session validation

## Out of scope

- Scan targets, scanner, Git, dashboard data, HTTP API (later phases)

## Deliverables

- [ ] `sessions`, `audit_log` tables
- [ ] Single-user login flow
- [ ] Session cookie + server-side session validation
- [ ] Logout
- [ ] Redaction package with deterministic `[REDACTED]` output
- [ ] Phase 1 middleware now enforces real sessions

## Acceptance criteria

- [ ] User can log in with the configured username/password
- [ ] Session persists through refresh
- [ ] Logout clears the session
- [ ] Audit log records login success/failure and logout
- [ ] Tests cover auth (hash verification) and redaction

## Recommendations / Watch-outs

- **Use `argon2id`** for the password hash instead of the PRD's interim SHA-256. Stronger, small dependency, no migration debt. (This supersedes the PRD's SHA-256 default; the `STIRILO_PASSWORD_SHA256` env var name and `.env.example`/README hash-generation command are a follow-up to reconcile, not renamed here.)
- **Session token:** generate with `crypto.randomBytes`, persist only its **hash** (SHA-256 is fine for a high-entropy token, unlike a password).
- **Redaction tests** must use real-shaped fixtures: a GitHub PAT, an AWS access key, a JWT, and a `postgres://user:pass@host` URL.

## Safety notes

- Compare credentials with a **timing-safe** comparison.
- Store the session **hash**, never the raw token.
- Cookie: `httpOnly`, `sameSite=lax`, `secure` in production, server-side validation.
- The HTTP API will use a **separate** `STIRILO_AGENT_TOKEN` (Phase 7), distinct from the user session.
- Never expose `process.env` through any route. Never log secrets in the audit log.
