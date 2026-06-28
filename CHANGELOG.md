# Changelog

All notable changes to Stirilo are documented here.

## v0.1.0

First release. A local-first, secrets-safe system control dashboard.

### Added

- **Foundation:** pnpm workspace, TypeScript project references, ESLint (flat
  config, Allman style), gitleaks + pre-commit hooks, commitlint, CI.
- **Web app:** Next.js App Router on `127.0.0.1:3157`, Tailwind + shadcn-style
  UI, dark mode, sidebar/topbar layout.
- **Auth:** single-user login with argon2id, server-validated sessions, logout,
  audit logging. Interactive `pnpm setup` to configure credentials.
- **Persistence:** SQLite via Drizzle with migrations; config validated with Zod
  (fail-fast).
- **Scan targets:** add/list/detail with realpath canonicalization, a
  segment-aware blocklist, and explicit confirmation for sensitive paths.
- **Filesystem scanner:** metadata-only scanning that never reads file contents;
  sensitive-file and project-marker detection.
- **Git scanner:** repository detection and status (branch, dirty state, counts,
  last commit) with credential-stripped remote URLs.
- **Dashboard:** summary cards with empty/loading/error states, plus system
  health.
- **HTTP API:** authenticated (agent token) read-first JSON API with a stable
  error shape.
- **MCP server:** read-only tools over the HTTP API for AI agents.
- **Docs:** README, SECURITY, CONTRIBUTING, architecture, security model,
  scanner, API, MCP, and a command-runner design.

### Security

- Secrets are never read or stored; detection is metadata-only.
- App binds to loopback, never runs as root, and performs no command execution
  (the command runner is design-only).

### Not included (planned)

- Command execution, scheduled scans, LAN access, multi-user, API tokens stored
  in SQLite.
