# Phase 6: Dashboard v1

**Status:** Done
**Depends on:** Phase 5
**PRD reference:** Milestone 6, Implementation Order step 11

## Goal

A useful at-a-glance dashboard that summarizes scan and Git data, with proper empty, loading, and error states.

## In scope

- Dashboard cards aggregating data from prior phases:
  - Tracked directory count
  - Repo count
  - Dirty repo count
  - Last scan status
  - Sensitive marker count
  - Large file summary
  - Recent changes summary
  - System health summary

## Out of scope

- HTTP API (Phase 7)
- New data sources (this phase aggregates existing data)

## Deliverables

- [x] Dashboard cards for each summary above
- [x] Empty state (before any scans)
- [x] Loading states
- [x] Error states

## Acceptance criteria

- [x] Dashboard gives a useful overview after scans
- [x] Empty state works before scans
- [x] Loading and error states work

## Recommendations / Watch-outs

- **Compute counts and summaries with SQL in the db/server layer**, not by recomputing client-side. Keep empty/loading/error as first-class states; the empty (first-run) state is what most dashboards get wrong.

## Safety notes

- Surface counts and summaries only; never render sensitive file contents or environment values.

## Implementation Checklist

1. [x] Add server-layer aggregation queries (SQL counts/summaries)
2. [x] Build the dashboard cards: tracked dirs, repos, dirty repos, last scan, sensitive markers, large files, recent changes, system health
3. [x] Implement empty, loading, and error states
4. [x] Add tests/E2E covering dashboard render and the empty state

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** `pnpm test:e2e` passes; dashboard shows a useful overview after scans and a clean empty state before
- [x] `git status` + `git diff --staged` reviewed; no secrets staged
- [x] This file's **Status** changed to `Done`
- [x] Committed locally, no push: `feat: Add dashboard summary`
