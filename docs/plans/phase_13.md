# Phase 13: Git Intelligence

**Status:** Planned
**Depends on:** Phase 10 (git scanner)
**PRD reference:** Beyond PRD v0.1 (roadmap); incorporates the "git remote freshness" note from `not_done.md`

## Goal

Aggregate the per-repo Git data already collected into a cross-repo view that flags risk and surfaces activity, while keeping scanning read-only and hook-free.

## In scope

- **"At-risk" dashboard:** repos with uncommitted changes, repos with unpushed commits, repos with **no remote** (loss risk), and stale branches - aggregated across all scanned repos.
- **Optional fetch-based freshness:** behind an explicit, off-by-default toggle, run `git fetch` during scans to compute true ahead/behind and a "remote last commit" column. This is a deliberate behavior change (the scanner is read-only and never fetches today).
- **Activity view:** commit cadence and last-active repos derived from `git log` (read-only).

## Out of scope

- Any write operation against repos (commit, push, pull, checkout).
- Running Git hooks during scans.
- Acting on at-risk repos automatically.

## Deliverables

- [ ] At-risk dashboard: dirty, unpushed, no-remote, and stale-branch sections.
- [ ] Off-by-default fetch toggle producing true ahead/behind + remote last commit.
- [ ] Activity view (commit cadence, last-active) from `git log`.
- [ ] Server-layer aggregation queries across `git_repositories` / `git_status_snapshots`.

## Acceptance criteria

- [ ] At-risk categories computed across all scanned repos, not per-repo only.
- [ ] Fetch is off by default; enabling it is explicit and documented as a behavior change.
- [ ] All Git invocations use safe argv arrays, never shell strings; no hooks run.
- [ ] Remote URLs remain sanitized (no embedded credentials) everywhere.

## Recommendations / Watch-outs

- `git fetch` has network cost and can be slow/failing on many repos: time-box it, surface per-repo fetch errors, and never block a scan on it.
- "No remote" is the highest-signal risk (work that exists only locally) - make it prominent.
- Reuse the sortable git table from the existing git list rather than building a new table component.

## Safety notes

- **Sanitize Git remote URLs** before storing/displaying; never store tokens or passwords from remotes.
- Prefer Git CLI with safe argument arrays; **do not run Git hooks** as part of scanning.
- The app must never run as root; fetch uses the user's existing credentials only.

## Implementation Checklist

1. [ ] Add aggregation queries for dirty / unpushed / no-remote / stale-branch.
2. [ ] Build the at-risk dashboard with those sections.
3. [ ] Add the off-by-default fetch toggle + true ahead/behind + remote last commit.
4. [ ] Add the activity view from `git log`.
5. [ ] Tests: remote sanitization, no-hooks invocation, fetch-disabled default, at-risk classification.

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** at-risk dashboard correctly flags a seeded dirty/no-remote repo; fetch stays off unless toggled; remote URLs render sanitized
- [ ] `git status` + `git diff --staged` reviewed; no secrets staged
- [ ] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Add cross-repo git intelligence dashboard`
