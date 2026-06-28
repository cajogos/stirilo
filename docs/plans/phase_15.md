# Phase 15: Scheduling and Alerting

**Status:** Planned
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

- [ ] Cron-style scheduler for scan targets.
- [ ] Change digest produced from Phase 14 diffs.
- [ ] Threshold alert rules (disk %, new sensitive marker, repo dirty).
- [ ] At least one delivery channel (webhook) with redacted payloads.
- [ ] Alert/schedule configuration in settings, validated with Zod.

## Acceptance criteria

- [ ] Scheduled scans run without a logged-in browser session.
- [ ] Alert payloads are redacted (no secrets, no env, no file contents).
- [ ] Alert rules are configurable and validated; invalid config is rejected with the stable error shape.
- [ ] Every scheduled run and alert dispatch writes an audit-log entry.

## Recommendations / Watch-outs

- A scheduled scanner runs unattended: it must use the agent/server identity, never a user session, and must not require sudo or root.
- Make alert thresholds explicit and conservative by default to avoid noise.
- Webhook delivery is an outbound network action - document it and keep it opt-in.

## Safety notes

- **Redact** all alert/webhook/email content through the existing redaction layer; output for any matched pattern is the literal `[REDACTED]`.
- Never include sensitive-file contents or environment values in a notification - markers are metadata only.
- Mutating actions (creating schedules, sending alerts) write to the audit log; never log secrets.

## Implementation Checklist

1. [ ] Add scheduler (cron parsing + runner) tied to scan targets.
2. [ ] Build the change digest from Phase 14 diffs.
3. [ ] Implement threshold alert rules.
4. [ ] Implement webhook delivery with redacted payloads (add email/desktop optionally).
5. [ ] Add Zod-validated schedule/alert config in settings + audit entries.
6. [ ] Tests: redaction of payloads, schedule firing, threshold evaluation, audit entries.

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** a scheduled scan fires unattended and emits a redacted digest; a seeded threshold breach produces a redacted alert with an audit entry
- [ ] `git status` + `git diff --staged` reviewed; no secrets staged
- [ ] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Add scheduled scans and change alerting`
