# Phase 3: Scan Targets

**Status:** Not started
**Depends on:** Phase 2b
**PRD reference:** Milestone 3, Implementation Order step 8

## Goal

Let the user register local directories as scan targets, with strict path validation and a blocklist, persisted and visible in the UI.

## In scope

- `scan_targets` table
- Scan target list page (`/scan-targets`) and detail page (`/scan-targets/:id`)
- Add scan target form
- Path validation: must exist, be a directory, be readable
- Blocked path rules with explicit-confirmation handling
- Audit logging of create/update

## Out of scope

- Running scans / scanner package (Phase 4)
- Full HTTP API surface (Phase 7) — a minimal internal list is enough here

## Deliverables

- [ ] `scan_targets` table (name, path unique, enabled, timestamps, last scan status/time)
- [ ] List page + add form
- [ ] Detail page
- [ ] Path validation logic (unit tested)
- [ ] Blocked-path rules (unit tested)
- [ ] Audit logging for scan target mutations

## Acceptance criteria

- [ ] User can add a valid directory
- [ ] Invalid path is rejected
- [ ] Blocked path requires explicit handling/confirmation
- [ ] Scan target is stored in SQLite
- [ ] Scan target appears in the UI
- [ ] Scan targets can be listed programmatically (formal API in Phase 7)

## Recommendations / Watch-outs

This is the highest-risk validation in the project. Get all three right:

- **Canonicalize with `fs.realpath`** (resolve symlinks and `..`) **before** the blocklist check, and store the canonical absolute path. Otherwise a symlink (e.g. `~/projects/x -> /`) or `..` traversal bypasses the blocklist.
- **Segment-aware blocklist matching**, not string prefix: `/home` must not match `/home-secrets`, and `/` must not match everything by naive prefix.
- **Expand `~` explicitly** and validate against the resolved real path.

## Safety notes

- Blocked by default: `/`, `~/.ssh`, `~/.gnupg`, `/proc`, `/sys`, `/dev`, `/run`, `/tmp`.
- Allowed only with explicit confirmation: `/etc`, `/var/log`, `/srv`, `/opt`, `/home/*`.
- Validate all inputs with Zod.

## Implementation Checklist

1. [ ] Add the `scan_targets` table + migration
2. [ ] Implement path validation: expand `~`, `fs.realpath` canonicalize, check exists/directory/readable
3. [ ] Implement segment-aware blocklist matching + explicit-confirmation handling
4. [ ] Add the list page `/scan-targets` and the add form
5. [ ] Add the detail page `/scan-targets/:id`
6. [ ] Add audit logging for scan-target create/update
7. [ ] Unit tests for path validation + blocklist, including symlink and `..` traversal cases

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** `pnpm test` passes; manual add of a valid dir works, invalid is rejected, blocked path requires confirmation
- [ ] `git status` + `git diff --staged` reviewed; no secrets staged
- [ ] This file's **Status** changed to `Done`
- [ ] Committed locally, no push: `feat: Add scan target management`
