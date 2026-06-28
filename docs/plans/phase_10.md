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

## Recommendations / Watch-outs

- **Run `gitleaks` over the full history** (`gitleaks detect`), not just the working tree, as the last gate before any push. This is the final check before the repo could go public.
- **Tag `v0.1.0`** (semver), and treat the tag as the decision point to revisit the "don't push yet" hold.

## Release verification (run before tagging)

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `gitleaks detect` over full history (no secrets in working tree **or history**)

## Safety notes

- Do **not** push to GitHub until Carlos explicitly approves the public release.
- Re-confirm no secrets exist anywhere in git history before any publish.
- License is **MIT**.

## Implementation Checklist

1. [ ] Complete all `README.md` sections
2. [ ] Complete `SECURITY.md` and the docs set (`architecture.md`, `security-model.md`, `scanner.md`, `api.md`, `mcp.md`)
3. [ ] Write release notes
4. [ ] Run the full verification chain and fix any failures
5. [ ] Run `gitleaks detect` over the full history
6. [ ] Tag `v0.1.0`

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build && gitleaks detect` all pass; a fresh clone can install/configure/run/test/build
- [ ] `gitleaks detect` over full history is clean (no secrets anywhere in history)
- [ ] This file's **Status** changed to `Done`
- [ ] Tagged `v0.1.0` locally; **do not push** until Carlos approves the public release
