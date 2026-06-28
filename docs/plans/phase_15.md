# Phase 15: Scheduling and Alerting

**Status:** Done (interval scheduling; cron expressions deferred)
**Depends on:** Phase 14 (diffs power change-based alerts)
**PRD reference:** Beyond PRD v0.1 (roadmap)

## Goal

Run scans on a schedule and notify on meaningful changes, so Stirilo becomes useful without a human watching the dashboard - while keeping all outbound content redacted and the system read-only.

## In scope

- **Scheduled scans:** cron-style scheduling of scan targets, with a digest of what changed (using Phase 14 diffs).
- **Threshold alerts:** disk crosses a configured percentage, a new sensitive-file marker appears, or a repo goes dirty.
- **Delivery channels:** webhook and/or desktop/email notification, all passing through the existing redaction layer.

## Out of scope

- Taking automated action in response to alerts (still read-only).
- Multi-tenant scheduling (single-user model for now).

## Deliverables

- [x] Interval scheduler for scan targets (per-target or all enabled), driven by `POST /api/cron/tick` (system cron / agent token; no browser session).
- [x] Alert rules use the Phase 14 diff (new sensitive files) plus disk % and dirty-repo conditions.
- [x] Threshold alert rules: disk %, new sensitive marker, dirty repos.
- [x] Webhook delivery with redacted, time-boxed payloads.
- [x] Schedule + alert configuration (Settings page + Schedules page); audited.

## Acceptance criteria

- [x] Scheduled scans run without a logged-in browser session (agent-token tick endpoint).
- [x] Alert payloads are redacted; they carry counts/messages only, never file contents or env values.
- [x] Alert rules are configurable; numeric inputs are clamped/validated server-side.
- [x] Schedule creation/toggle/delete and every alert dispatch write audit entries.

## Recommendations / Watch-outs

- A scheduled scanner runs unattended: it must use the agent/server identity, never a user session, and must not require sudo or root.
- Make alert thresholds explicit and conservative by default to avoid noise.
- Webhook delivery is an outbound network action - document it and keep it opt-in.

## Safety notes

- **Redact** all alert/webhook/email content through the existing redaction layer; output for any matched pattern is the literal `[REDACTED]`.
- Never include sensitive-file contents or environment values in a notification - markers are metadata only.
- Mutating actions (creating schedules, sending alerts) write to the audit log; never log secrets.

## Implementation Checklist

1. [x] Add `schedules` table (migration 0008) + `server/schedules.ts` (CRUD + `runDueSchedules`) + `isScheduleDue` (pure, in core).
2. [x] Reuse `getScanDiff` for the new-sensitive condition.
3. [x] Implement `evaluateAlerts` (pure, in core) for disk / sensitive / dirty.
4. [x] Implement redacted, time-boxed webhook delivery in `server/alerts.ts`; wired into the scan service post-completion.
5. [x] Add Schedules page + Settings alert/retention config + audit entries.
6. [x] Tests: core unit tests for `isScheduleDue` + `evaluateAlerts`; e2e for the cron tick auth + a schedule running.

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** e2e creates a schedule and the cron tick runs it (last-run set); core unit tests cover due-logic and alert evaluation; lint + typecheck + 65 unit + 18 e2e pass
- [x] `git status` + `git diff --staged` reviewed; no secrets staged
- [x] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Add scheduled scans and change alerting`

> Note: scheduling is interval-based (every N minutes) to avoid a cron-parser
> dependency; full cron expressions are a future addition. The in-process timer
> was dropped in favor of an external cron hitting `/api/cron/tick` (Next bundles
> instrumentation for the edge runtime, which cannot load better-sqlite3).
