# Phase 3: Scan Targets

**Status:** Done
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

- [x] `scan_targets` table (name, path unique, enabled, timestamps, last scan status/time)
- [x] List page + add form
- [x] Detail page
- [x] Path validation logic (unit tested)
- [x] Blocked-path rules (unit tested)
- [x] Audit logging for scan target mutations

## Acceptance criteria

- [x] User can add a valid directory
- [x] Invalid path is rejected
- [x] Blocked path requires explicit handling/confirmation
- [x] Scan target is stored in SQLite
- [x] Scan target appears in the UI
- [x] Scan targets can be listed programmatically (formal API in Phase 7)

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

1. [x] Add the `scan_targets` table + migration
2. [x] Implement path validation: expand `~`, `fs.realpath` canonicalize, check exists/directory/readable
3. [x] Implement segment-aware blocklist matching + explicit-confirmation handling
4. [x] Add the list page `/scan-targets` and the add form
5. [x] Add the detail page `/scan-targets/:id`
6. [x] Add audit logging for scan-target create/update
7. [x] Unit tests for path validation + blocklist, including symlink and `..` traversal cases

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** `pnpm test` passes; manual add of a valid dir works, invalid is rejected, blocked path requires confirmation
- [x] `git status` + `git diff --staged` reviewed; no secrets staged
- [x] This file's **Status** changed to `Done`
- [x] Committed locally, no push: `feat: Add scan target management`
