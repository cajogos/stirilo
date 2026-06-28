# Phase 10: v0.1 Release

**Status:** Not started
**Depends on:** Phase 9
**PRD reference:** Milestone 10, Implementation Order steps 14-15

## Goal

Harden, document, and tag v0.1: a project that a developer can clone, configure, run, test, and build, and that is safe to publish publicly.

## In scope

- Release notes
- Tagged version
- Complete `README.md`
- Complete security docs (`SECURITY.md`, `docs/security-model.md`)
- Documentation: `docs/architecture.md`, `docs/scanner.md`, `docs/api.md`, `docs/mcp.md`
- CI green, tests green
- Basic screenshots (optional)

## Out of scope

- Command execution, scheduled scans, LAN access, multi-user (post-v0.1)

## Deliverables

- [ ] Release notes
- [ ] Tagged version
- [ ] README complete (what Stirilo is, who it is for, quick start, security model, what it will not do, dev commands, DB location, env vars, testing, license)
- [ ] Security docs complete
- [ ] Required docs present: `architecture.md`, `security-model.md`, `scanner.md`, `api.md`, `mcp.md`
- [ ] CI green, tests green
- [ ] Screenshots (optional)

## Acceptance criteria

- [ ] Fresh clone can install, configure, run, test, and build
- [ ] Project is safe to publish publicly
- [ ] v0.1 provides: local dashboard, SQLite persistence, directory scanning, Git status, HTTP API, and optional MCP

## Release verification (run before tagging)

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `gitleaks scan` (no secrets in working tree **or history**)

## Safety notes

- Do **not** push to GitHub until Carlos explicitly approves the public release.
- Re-confirm no secrets exist anywhere in git history before any publish.
- Confirm the license before release (still TBD).
