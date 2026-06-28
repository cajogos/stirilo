# Phase 6: Dashboard v1

**Status:** Not started
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

- [ ] Dashboard cards for each summary above
- [ ] Empty state (before any scans)
- [ ] Loading states
- [ ] Error states

## Acceptance criteria

- [ ] Dashboard gives a useful overview after scans
- [ ] Empty state works before scans
- [ ] Loading and error states work

## Safety notes

- Surface counts and summaries only; never render sensitive file contents or environment values.
