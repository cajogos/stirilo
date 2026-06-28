# Phase 12: Scan Insights and Reports

**Status:** Planned
**Depends on:** Phase 10 (filesystem scanner + dashboard)
**PRD reference:** Beyond PRD v0.1 (roadmap)

## Goal

Turn the metadata the scanner already collects into actionable reports. Every item here is a pure *consumer* of existing scan data: no new reads of file contents, no change to the read-only/observational boundary.

## In scope

- **Sensitive-file dashboard:** a first-class drill-down of detected markers (path, size, mtime, detection rule only), grouped by scan target. The data and safety model already exist; this surfaces it as a dedicated view.
- **Disk reclamation report:** largest directories and files, `node_modules`/build-artifact detector with reclaimable-space totals, stale files (untouched for N months).
- **Duplicate detection:** group candidates by size, then confirm by content hash computed during scan. Never hash or open sensitive files (metadata only for those).
- **Project inventory:** language/framework breakdown across scanned projects, derived from manifest *presence* (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`).

## Out of scope

- Acting on findings (deleting files, cleaning artifacts) - this remains read-only.
- Reading sensitive-file contents to dedupe or classify them.
- Scheduling/alerting on these reports (Phase 15).

## Deliverables

- [ ] Sensitive-file inventory page with filter by target and detection rule.
- [ ] Disk reclamation report (largest dirs/files, artifacts, stale files) with reclaimable totals.
- [ ] Duplicate-file report grouped by size + content hash.
- [ ] Project inventory view with language/framework breakdown.
- [ ] Server-layer aggregation queries backing each report (SQL, not client-side recompute).

## Acceptance criteria

- [ ] Sensitive files are listed by metadata only; no content or env values ever rendered.
- [ ] Duplicate and hash logic skips sensitive-file paths entirely.
- [ ] Reports work with empty, loading, and error states.
- [ ] Totals (reclaimable space, counts) are computed in SQL/server layer.

## Recommendations / Watch-outs

- Store content hashes for non-sensitive files at scan time so reports don't re-walk the tree; treat hashing as opt-in if scan cost matters.
- "Reclaimable space" is advisory only - do not imply Stirilo will delete anything in v0.1.
- Reuse the existing dashboard card patterns and empty/loading/error states from Phase 6.

## Safety notes

- **Never read, hash, ingest, or display sensitive-file contents.** Detection stays metadata-only (path/size/mtime/rule).
- Redact any path-derived strings through the existing redaction layer before display/logging.

## Implementation Checklist

1. [ ] Add server-layer aggregation queries for each report.
2. [ ] Extend the scanner to record content hashes for non-sensitive files (opt-in).
3. [ ] Build the sensitive-file inventory page (metadata-only).
4. [ ] Build the disk reclamation report.
5. [ ] Build the duplicate-file report.
6. [ ] Build the project inventory view.
7. [ ] Add unit tests (hash skips sensitive paths) + E2E for each report.

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** integration test proves sensitive files appear in the inventory *without being opened*; reports render with real scan data and clean empty states
- [ ] `git status` + `git diff --staged` reviewed; no secrets staged
- [ ] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Add scan insight reports`
