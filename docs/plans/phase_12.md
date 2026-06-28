# Phase 12: Scan Insights and Reports

**Status:** Done (duplicate detection is metadata-only by design; see note)
**Depends on:** Phase 10 (filesystem scanner + dashboard)
**PRD reference:** Beyond PRD v0.1 (roadmap)

> **Safety divergence (intentional):** the plan called for confirming duplicates
> by *content hash*. Hashing requires opening files, which risks reading a secret
> that name-based detection missed. The non-negotiable metadata-only invariant
> ("choose the path that reads less") overrides this, so duplicate detection
> groups non-sensitive files by **size + filename** only and is labelled a
> heuristic in the UI. No file contents are ever read.

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

- [x] Sensitive-file inventory page (`/sensitive`) grouped by target, with per-rule counts.
- [x] Disk reclamation report (`/insights`): largest dirs/files, artifact directories, stale files, with reclaimable + duplicate-waste totals.
- [x] Duplicate report grouped by size + filename (metadata-only; content hashing deliberately not used - see note).
- [x] Project inventory view (`/insights`) with marker breakdown across targets.
- [x] Server-layer aggregation in `apps/web/src/server/insights.ts`; API routes under `/api/insights/*`.

## Acceptance criteria

- [x] Sensitive files are listed by metadata only; no content or env values ever rendered.
- [x] Duplicate logic skips sensitive-file paths entirely (excluded from the size+name map).
- [x] Reports work with empty states (no-scan and per-section).
- [x] Totals (reclaimable space, duplicate waste, counts) computed in the server layer.

## Recommendations / Watch-outs

- Store content hashes for non-sensitive files at scan time so reports don't re-walk the tree; treat hashing as opt-in if scan cost matters.
- "Reclaimable space" is advisory only - do not imply Stirilo will delete anything in v0.1.
- Reuse the existing dashboard card patterns and empty/loading/error states from Phase 6.

## Safety notes

- **Never read, hash, ingest, or display sensitive-file contents.** Detection stays metadata-only (path/size/mtime/rule).
- Redact any path-derived strings through the existing redaction layer before display/logging.

## Implementation Checklist

1. [x] Add server-layer aggregation (`insights.ts`) reading the latest completed summary per target.
2. [x] Extend the scanner (metadata-only): largest directories, stale files, artifact-dir measurement + reclaimable bytes, and size+name duplicate groups (sensitive files excluded).
3. [x] Build the sensitive-file inventory page (metadata-only).
4. [x] Build the disk reclamation report.
5. [x] Build the duplicate report.
6. [x] Build the project inventory view.
7. [x] Add unit tests (duplicates exclude sensitive files; contents never read) + E2E (sensitive inventory via API without leaking contents).

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** scanner unit test proves a `.env` is detected without its sentinel contents entering the result; e2e proves the sensitive inventory API lists `.env` without leaking contents; lint + typecheck + 55 unit + 14 e2e pass
- [x] `git status` + `git diff --staged` reviewed; no secrets staged
- [x] This file's **Status** changed to `Done`
- [ ] Committed locally: `feat: Add scan insight reports`
