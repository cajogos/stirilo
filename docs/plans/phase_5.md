# Phase 5: Git Scanner

**Status:** Done
**Depends on:** Phase 4
**PRD reference:** Milestone 5, Implementation Order step 10

## Goal

Detect Git repositories under scan targets and capture their status, with remote URLs sanitized of any embedded credentials.

## In scope

- `packages/git/`
- Repo detection under scan targets
- `git_repositories` and `git_status_snapshots` tables
- Branch detection, dirty status, staged/unstaged/untracked counts, ahead/behind counts, last commit info
- Remote URL sanitization
- Git repo list page (`/git`) and detail page (`/git/:id`)

## Out of scope

- Any Git mutation (Stirilo is read-only)
- Command runner (Phase 9, design only)

## Deliverables

- [x] Git package with repo detection
- [x] `git_repositories` + `git_status_snapshots` tables
- [x] Branch, dirty status, staged/unstaged/untracked, ahead/behind, last commit hash/subject/date
- [x] Remote URL sanitization (unit tested)
- [x] Git repo list + detail pages

## Acceptance criteria

- [x] Scan detects Git repositories
- [x] Repo status is displayed
- [x] Dirty repositories are highlighted
- [x] Remote URLs are sanitized
- [x] Tests cover token-containing remote URLs

## Recommendations / Watch-outs

- **Use `execFile` with argument arrays** (no shell, no libraries that shell out). `status`/`log`/`rev-parse` do not trigger hooks, but add `-c core.hooksPath=/dev/null` as belt-and-suspenders.
- **Sanitize both remote forms:** URL form (`https://token@host/...`, strip userinfo) and scp-like form (`git@host:path`, which is not a parseable URL). Test both, plus the token-in-URL case.
- **Coordinate detection vs enrichment:** the scanner (Phase 4) detects `.git` presence; this package enriches. Do not duplicate the directory walk.

## Safety notes

- Strip credentials from remotes (`https://token@host/...`, `https://user:pass@host/...`). Never store tokens or passwords.
- Prefer Git CLI with safe argument arrays, never shell strings.
- Do not execute Git hooks as part of scanning.
- Allowed read-only commands: `git status --porcelain=v1 --branch`, `git rev-parse --abbrev-ref HEAD`, `git log -1 --pretty=...`, `git remote get-url origin`.

## Implementation Checklist

1. [x] Create `packages/git` using `execFile` with arg arrays + `-c core.hooksPath=/dev/null`
2. [x] Implement repo detection, consuming the scanner's `.git` detection (no duplicate walk)
3. [x] Add the `git_repositories` and `git_status_snapshots` tables + migration
4. [x] Capture branch, dirty status, staged/unstaged/untracked, ahead/behind, last commit info
5. [x] Implement remote URL sanitization for URL form and scp-like form
6. [x] Add the `/git` list page and `/git/:id` detail page
7. [x] Tests: remote sanitization including token-containing remotes (both forms)

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** `pnpm test` passes; a scan detects repos, dirty ones are highlighted, remotes are sanitized
- [x] `git status` + `git diff --staged` reviewed; no remote credentials or secrets staged
- [x] This file's **Status** changed to `Done`
- [x] Committed locally, no push: `feat: Add git scanner with remote sanitization`
