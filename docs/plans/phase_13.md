# Phase 13: Git Intelligence

**Status:** Done
**Depends on:** Phase 10 (git scanner)
**PRD reference:** Beyond PRD v0.1 (roadmap); incorporates the "git remote freshness" note from `not_done.md`

## Implementation notes

- At-risk analysis (`server/git-intel.ts`) is a pure consumer of the latest
  status snapshot per repo; page at `/git/at-risk`, API at `/api/git/at-risk`.
- "Stale" is interpreted at the repo level (no commit in 180+ days), since
  snapshots track the current branch's last commit, not every branch.
- Off-by-default fetch: `getGitStatus(path, { fetch })` runs a time-boxed
  `git fetch --quiet --no-tags` and captures the upstream commit date
  (`remoteLastCommitDate`, new DB column, migration `0006`). Controlled by the
  `git.fetch_on_scan` setting, toggled on the Settings page.

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

- [x] At-risk dashboard: dirty, unpushed, no-remote, and stale sections (`/git/at-risk`).
- [x] Off-by-default fetch toggle producing true ahead/behind + remote last commit date.
- [x] Activity view (most recently committed repos) on the at-risk page.
- [x] Server-layer aggregation over the latest snapshot per repository.

## Acceptance criteria

- [x] At-risk categories computed across all scanned repos, not per-repo only.
- [x] Fetch is off by default; enabling it is explicit (Settings toggle) and documented as a behavior change.
- [x] All Git invocations use safe argv arrays, never shell strings; hooks stay disabled (`core.hooksPath=/dev/null`).
- [x] Remote URLs remain sanitized (no embedded credentials) everywhere.

## Recommendations / Watch-outs

- `git fetch` has network cost and can be slow/failing on many repos: time-box it, surface per-repo fetch errors, and never block a scan on it.
- "No remote" is the highest-signal risk (work that exists only locally) - make it prominent.
- Reuse the sortable git table from the existing git list rather than building a new table component.

## Safety notes

- **Sanitize Git remote URLs** before storing/displaying; never store tokens or passwords from remotes.
- Prefer Git CLI with safe argument arrays; **do not run Git hooks** as part of scanning.
- The app must never run as root; fetch uses the user's existing credentials only.

## Implementation Checklist

1. [x] Add aggregation (`git-intel.ts`) for dirty / unpushed / no-remote / stale.
2. [x] Build the at-risk dashboard with those sections + summary stats.
3. [x] Add the off-by-default fetch option (git pkg) + remoteLastCommitDate column + Settings toggle + scan-service wiring.
4. [x] Add the activity view (recent commits) on the at-risk page.
5. [x] Tests: git fetch/remote-date unit test; e2e proving no-remote repo is flagged.

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** e2e flags a seeded no-remote repo via `/api/git/at-risk`; git unit test proves remoteLastCommitDate is set only with fetch; lint + typecheck + 56 unit + 15 e2e pass
- [x] `git status` + `git diff --staged` reviewed; no secrets staged
- [x] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Add cross-repo git intelligence dashboard`
