# Stirilo Build Plans

The phased plan to build Stirilo to v0.1 (phases 0-10) is **complete**. The
per-phase files for that work have been removed now that it is done and
committed (tagged `v0.1.0`).

- What shipped: [../../CHANGELOG.md](../../CHANGELOG.md)
- The original PRD lives at `prd.pdf` (gitignored).

## Post-v0.1 roadmap (planned)

The next phases continue the numbering from the v0.1 build. They are planned,
not started, and all respect the read-only/observational boundary and the
safety invariants in `CLAUDE.md`.

- [Phase 11: Close v0.1 Open Loops](phase_11.md) - CI green, zod-to-openapi, dedicated verification `distDir`.
- [Phase 12: Scan Insights and Reports](phase_12.md) - sensitive-file dashboard, disk reclamation, duplicates, project inventory.
- [Phase 13: Git Intelligence](phase_13.md) - cross-repo at-risk dashboard, optional fetch freshness, activity view.
- [Phase 14: History and Change Over Time](phase_14.md) - scan diffs, health trends, retention.
- [Phase 15: Scheduling and Alerting](phase_15.md) - scheduled scans, threshold alerts, redacted delivery.
- [Phase 16: MCP and API Depth](phase_16.md) - new MCP tools, rate limiting, audit export, `argon2id`.

Outstanding items carried over from the v0.1 phases are folded into
[Phase 11](phase_11.md); see also [not_done.md](not_done.md).

Project documentation is under [`docs/`](../): architecture, security model,
scanner, API, MCP, and the command-runner design.
