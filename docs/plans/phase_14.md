# Phase 14: History and Change Over Time

**Status:** Done
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

- [x] Scan-diff view (on the scan-target detail page) + `/api/scan-targets/{id}/diff`: new/removed sensitive markers, file/size/reclaimable deltas.
- [x] Persisted health snapshots (memory, load, disk, uptime) + inline SVG trend charts on `/health`.
- [x] Configurable history retention (days) on the Settings page; pruning runs after each scan.
- [x] Server-layer diff (`scan-diff.ts`) and history (`health-history.ts`) modules.

## Acceptance criteria

- [x] Diffs are computed from stored metadata only; no content is retained to diff.
- [x] Health trends render from persisted snapshots (captured on each scan).
- [x] Retention prunes old scan runs / git + health snapshots; 0 (default) keeps all.

## Recommendations / Watch-outs

- Define a stable identity for a scanned item (path + target) so diffs are meaningful across runs.
- Decide snapshot cadence for health early (e.g. on a timer vs on scan) - it drives DB growth; pair it with retention.
- Charts should degrade gracefully with sparse history (first-run empty state).

## Safety notes

- History stores the same metadata-only fields as live scans; **never** persist sensitive-file contents or environment values.
- Run redaction over any stored metadata strings before they hit the DB.

## Implementation Checklist

1. [x] Add `health_snapshots` table (migration 0007); reuse existing `scan_runs` summaries for diffs.
2. [x] Implement `getScanDiff` over the two latest completed runs.
3. [x] Build the scan-diff view on the scan-target detail page.
4. [x] Persist health snapshots on scan; build inline SVG trend charts (no external chart lib, CSP-safe).
5. [x] Add retention setting + `pruneHistory` run after each scan.
6. [x] Tests: e2e proves a newly added .env appears in the diff's addedSensitive.

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** e2e seeds two scans and asserts the diff reports the added .env; health charts render from persisted snapshots; lint + typecheck + 56 unit + 16 e2e pass
- [x] `git status` + `git diff --staged` reviewed; no secrets staged
- [x] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Add scan history, diffs, and health trends`

> Note: live SSE updates for health trends were deemed unnecessary - trends are
> captured on scan and the page renders them server-side. The SSE infra remains
> available if a live host monitor is added later.
