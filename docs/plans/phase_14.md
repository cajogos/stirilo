# Phase 14: History and Change Over Time

**Status:** Planned
**Depends on:** Phase 12 and Phase 13 (richest with their data sources); builds on existing scan/git/health data
**PRD reference:** Beyond PRD v0.1 (roadmap)

## Goal

Each scan is currently a point-in-time snapshot. Persist and compare snapshots so Stirilo can answer "what changed since last time" and chart trends, without storing any new sensitive data.

## In scope

- **Scan diffs:** compare consecutive scan runs and report new/removed sensitive-file markers, repos that went dirty or clean, and notable size deltas.
- **Health trends:** persist system-health snapshots over time and chart CPU / memory / disk usage. Reuse the SSE infrastructure built for live scan progress for live updates.
- **Retention controls:** a configurable retention window for historical snapshots to bound DB growth.

## Out of scope

- Alerting/notifying on changes (Phase 15 consumes these diffs).
- Storing any file content or env values in history.

## Deliverables

- [ ] Scan-diff view comparing two scan runs (new/removed sensitive markers, dirty/clean transitions, size deltas).
- [ ] Persisted health snapshots + trend charts (CPU/mem/disk).
- [ ] Configurable retention for historical snapshots.
- [ ] Server-layer diff/aggregation queries.

## Acceptance criteria

- [ ] Diffs are computed from stored metadata only; no content is retained to diff.
- [ ] Health trends render from persisted snapshots; live update path reuses existing SSE.
- [ ] Retention prunes old snapshots without breaking the latest views.

## Recommendations / Watch-outs

- Define a stable identity for a scanned item (path + target) so diffs are meaningful across runs.
- Decide snapshot cadence for health early (e.g. on a timer vs on scan) - it drives DB growth; pair it with retention.
- Charts should degrade gracefully with sparse history (first-run empty state).

## Safety notes

- History stores the same metadata-only fields as live scans; **never** persist sensitive-file contents or environment values.
- Run redaction over any stored metadata strings before they hit the DB.

## Implementation Checklist

1. [ ] Add tables/columns for retained scan and health snapshots (Drizzle migration).
2. [ ] Implement diff queries between two scan runs.
3. [ ] Build the scan-diff view.
4. [ ] Persist health snapshots; build trend charts; wire SSE for live updates.
5. [ ] Add retention config + pruning job.
6. [ ] Tests: diff correctness, retention pruning, no-content-stored invariant.

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** seeding two scans produces a correct diff; health charts render from persisted snapshots; retention prunes as configured
- [ ] `git status` + `git diff --staged` reviewed; no secrets staged
- [ ] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Add scan history, diffs, and health trends`
