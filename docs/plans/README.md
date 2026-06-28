# Stirilo Build Plans

The phased plan to build Stirilo to v0.1 (phases 0-10) is **complete**. The
per-phase files for that work have been removed now that it is done and
committed (tagged `v0.1.0`).

- What shipped: [../../CHANGELOG.md](../../CHANGELOG.md)
- The original PRD lives at `prd.pdf` (gitignored).

## Post-v0.1 roadmap (built)

Phases 11-16 continue the numbering from the v0.1 build. All are **implemented
and verified locally** (lint, typecheck, unit, e2e, build, gitleaks) and respect
the read-only/observational boundary and the safety invariants in `CLAUDE.md`.

- [Phase 11: Close v0.1 Open Loops](phase_11.md) - DONE (zod-to-openapi, dedicated verification `distDir`). CI-green still needs a push.
- [Phase 12: Scan Insights and Reports](phase_12.md) - DONE (sensitive-file dashboard, disk reclamation, duplicates, project inventory; duplicates are metadata-only).
- [Phase 13: Git Intelligence](phase_13.md) - DONE (cross-repo at-risk dashboard, optional fetch freshness, activity view).
- [Phase 14: History and Change Over Time](phase_14.md) - DONE (scan diffs, health trends, retention).
- [Phase 15: Scheduling and Alerting](phase_15.md) - DONE (interval schedules via cron tick, threshold alerts, redacted webhook).
- [Phase 16: MCP and API Depth](phase_16.md) - DONE (7 new MCP tools, rate limiting, audit export/retention; argon2id already in place).

The only outstanding item across all phases is the first CI run, which requires
a push (deliberately deferred); see [not_done.md](not_done.md).

Project documentation is under [`docs/`](../): architecture, security model,
scanner, API, MCP, and the command-runner design.
