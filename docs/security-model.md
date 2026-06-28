# Security Model

Stirilo inspects a developer's own machine, so it is built to be safe by default.
This document describes the guarantees and how they are enforced.

## Guarantees

### Secrets are never read

The filesystem scanner (`@stirilo/scanner`) only ever calls `readdir` and
`lstat`. It records that sensitive files exist (path, size, modified time,
detection rule) but never opens them. This is enforced two ways:

- An ESLint rule forbids importing any file-read API (`readFile`, `open`, …) in
  `packages/scanner/src`.
- A test writes a `.env` containing a known secret and asserts the secret value
  never appears anywhere in the scan result.

### Secrets are never stored or exposed

- `@stirilo/redaction` replaces common secret patterns (tokens, keys, JWTs, DB
  URLs with passwords, `password=`/`token=`/… pairs) with `[REDACTED]`. Scan
  summaries and command output (future) are redacted before storage.
- The HTTP API never returns `.env` contents, environment variables, raw session
  data, or the agent token.
- `.env`, database files, keys, and certificates are gitignored; only
  `.env.example` (placeholders) is committed. CI runs gitleaks and a pre-commit
  hook scans staged changes.

### Git credentials are stripped

Remote URLs are sanitized (`@stirilo/git`) before storage or display: userinfo is
removed from URL-form remotes and the host is extracted from scp-form remotes.
Tokens and passwords are never stored.

### Path safety

Scan-target paths are canonicalized with `fs.realpath` (resolving symlinks and
`..`) **before** the blocklist is applied, so neither symlinks nor traversal can
slip a blocked location past validation. Matching is segment-aware. Blocked and
sensitive locations require explicit confirmation.

## Authentication

- **UI:** single-user login. Password verified with argon2id using a
  constant-time comparison. Sessions store only a hash of the token (generated
  with `crypto.randomBytes`); the cookie is `httpOnly`, `sameSite=lax`, and
  `secure` in production. Server-side validation is authoritative; the edge
  middleware is a coarse cookie gate.
- **HTTP API:** a separate `STIRILO_AGENT_TOKEN`, sent as a bearer token and
  compared in constant time. Distinct from the user session.

## Least privilege

- The app binds to `127.0.0.1` by default; LAN access is opt-in.
- The app never runs as root and never calls sudo.
- v0.1 is read-only: no arbitrary command execution, no file writes to scanned
  directories, no system mutation. The command runner is design-only
  (`docs/command-runner.md`).

## Auditing

Mutating actions (login, logout, scan-target creation, scans) are recorded in the
`audit_log` table with actor, action, target, metadata, and timestamp. Secrets
are never written to the audit log.

## Reporting

See [SECURITY.md](../SECURITY.md) for how to report a vulnerability.
