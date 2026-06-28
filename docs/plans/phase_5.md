# Phase 5: Git Scanner

**Status:** Not started
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

- [ ] Git package with repo detection
- [ ] `git_repositories` + `git_status_snapshots` tables
- [ ] Branch, dirty status, staged/unstaged/untracked, ahead/behind, last commit hash/subject/date
- [ ] Remote URL sanitization (unit tested)
- [ ] Git repo list + detail pages

## Acceptance criteria

- [ ] Scan detects Git repositories
- [ ] Repo status is displayed
- [ ] Dirty repositories are highlighted
- [ ] Remote URLs are sanitized
- [ ] Tests cover token-containing remote URLs

## Recommendations / Watch-outs

- **Use `execFile` with argument arrays** (no shell, no libraries that shell out). `status`/`log`/`rev-parse` do not trigger hooks, but add `-c core.hooksPath=/dev/null` as belt-and-suspenders.
- **Sanitize both remote forms:** URL form (`https://token@host/...`, strip userinfo) and scp-like form (`git@host:path`, which is not a parseable URL). Test both, plus the token-in-URL case.
- **Coordinate detection vs enrichment:** the scanner (Phase 4) detects `.git` presence; this package enriches. Do not duplicate the directory walk.

## Safety notes

- Strip credentials from remotes (`https://token@host/...`, `https://user:pass@host/...`). Never store tokens or passwords.
- Prefer Git CLI with safe argument arrays, never shell strings.
- Do not execute Git hooks as part of scanning.
- Allowed read-only commands: `git status --porcelain=v1 --branch`, `git rev-parse --abbrev-ref HEAD`, `git log -1 --pretty=...`, `git remote get-url origin`.
