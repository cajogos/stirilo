# Stirilo Build Plans

Phased plan for building Stirilo to v0.1. Each phase is a buildable, independently verifiable unit derived from the PRD milestones. Build them in order; each depends on the previous.

The PRD (`prd.pdf`, gitignored) is the reference for *what*; Carlos's conventions and `CLAUDE.md` are the source of truth for *how*.

| Phase | Title | Theme |
| --- | --- | --- |
| [0](phase_0.md) | Repository Foundation | pnpm workspace, tooling, CI, gitleaks, security docs |
| [1](phase_1.md) | Web App Shell | Next.js, Tailwind, shadcn/ui, layout, placeholder pages |
| [2a](phase_2a.md) | Persistence & Config | Drizzle, migrations, settings, Zod env validation |
| [2b](phase_2b.md) | Auth, Audit & Redaction | Single-user login, sessions, audit log, redaction |
| [3](phase_3.md) | Scan Targets | Directory targets, path validation, blocklist |
| [4](phase_4.md) | Filesystem Scanner | Metadata-only scan, sensitive-file markers |
| [5](phase_5.md) | Git Scanner | Repo detection, status snapshots, remote sanitization |
| [6](phase_6.md) | Dashboard v1 | Summary cards, empty/loading/error states |
| [7](phase_7.md) | HTTP API v1 | Authenticated read-first JSON API |
| [8](phase_8.md) | MCP Server v1 | Read-only tools over the HTTP API |
| [9](phase_9.md) | Command Runner (Design Only) | Security design, no implementation |
| [10](phase_10.md) | v0.1 Release | Hardening, docs, tag |

## Conventions for these plans

- Status values: `Not started`, `In progress`, `Done`.
- Every phase carries safety notes; the invariants in `CLAUDE.md` always win.
- Do not start a phase before its dependencies are `Done`.
