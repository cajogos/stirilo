# Phase 2b: Auth, Audit & Redaction

**Status:** Done
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

- [x] `sessions`, `audit_log` tables
- [x] Single-user login flow
- [x] Session cookie + server-side session validation
- [x] Logout
- [x] Redaction package with deterministic `[REDACTED]` output
- [x] Phase 1 middleware now enforces real sessions

## Acceptance criteria

- [x] User can log in with the configured username/password
- [x] Session persists through refresh
- [x] Logout clears the session
- [x] Audit log records login success/failure and logout
- [x] Tests cover auth (hash verification) and redaction

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

## Implementation Checklist

1. [x] Add the `sessions` and `audit_log` table schemas + migration
2. [x] Create `packages/redaction` with deterministic `[REDACTED]` output
3. [x] Create `packages/auth`: argon2id hasher behind a `PasswordHasher` interface
4. [x] Implement login (timing-safe), session creation (`crypto.randomBytes`, store hash), HTTP-only cookie
5. [x] Implement logout
6. [x] Wire the Phase 1 middleware to real server-side session validation
7. [x] Write audit entries for login success/failure and logout
8. [x] Tests: auth hash verification + redaction real-shaped fixtures (PAT/AWS/JWT/DB-URL)

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** `pnpm test` (auth + redaction) passes; manual login → refresh → logout works; audit log shows the events
- [x] `git status` + `git diff --staged` reviewed; no secrets or session data staged
- [x] This file's **Status** changed to `Done`
- [x] Committed locally, no push: `feat: Add single-user auth, audit log, and redaction`
