# Phase 4: Filesystem Scanner

**Status:** Not started
**Depends on:** Phase 3
**PRD reference:** Milestone 4, Implementation Order step 9

## Goal

A metadata-only filesystem scanner that produces useful summaries of a scan target without ever reading sensitive file contents.

## In scope

- `packages/scanner/`
- Manual scan action
- `scan_runs` table usage
- Metadata outputs: file count, directory count, total size, largest files, recently modified files, ignored directories
- Sensitive-file marker detection (metadata only)
- Package/project file detection
- Dashboard surfaces the scan summary

## Out of scope

- Scheduled/watch/incremental scans (future)
- Git-specific data (Phase 5)

## Deliverables

- [ ] Scanner package producing the required metadata outputs
- [ ] Manual scan action persisting to `scan_runs`
- [ ] Default ignored directories: `node_modules`, `.git`, `.next`, `dist`, `build`, `coverage`, `.cache`, `vendor`, `target`, `__pycache__`
- [ ] Sensitive-file detection storing path, size, modified time, detection rule only
- [ ] Package/project detection (lockfiles, config files, Dockerfiles, etc.)
- [ ] Dashboard shows scan summary

## Acceptance criteria

- [ ] Scan runs against a temporary test directory
- [ ] `node_modules` and `.git` are ignored for deep content scan
- [ ] `.env` file is detected but **not read**
- [ ] Scan result is stored
- [ ] Dashboard shows the scan summary
- [ ] Tests **prove** sensitive files are detected without being read

## Recommendations / Watch-outs

- **Make "never reads contents" an architectural guarantee, not a discipline.** The scanner only ever calls `stat`/`readdir`/`lstat`, never `readFile`/`open` on a target file. Enforce with a lint rule banning `fs.readFile` in `packages/scanner` plus a test that spies on `fs` to assert no read happened. This is the strongest defense for the headline safety claim.
- **Prune ignored directories during traversal** (do not descend `node_modules`/`.git` then discard) - correctness and performance.
- **Bound largest/recent file lists to top-N** and use bounded async concurrency to cap memory on huge trees.

## Safety notes

- Detect sensitive files (`.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa`, `id_ed25519`, `*.p12`, `*.pfx`, `*.kdbx`, secret-bearing `*.sqlite`/`*.db`) by metadata only.
- Never read, ingest, display, log, or store secret file contents.
- Apply the redaction package to any captured output before storage.

## Implementation Checklist

1. [ ] Create `packages/scanner` using only `stat`/`readdir`/`lstat`
2. [ ] Add a lint rule banning `fs.readFile`/`open` on target files in `packages/scanner`
3. [ ] Implement traversal with ignored-dir pruning + bounded async concurrency
4. [ ] Compute file/directory count, total size, top-N largest and recently modified files
5. [ ] Implement sensitive-file marker detection (metadata only)
6. [ ] Implement package/project file detection
7. [ ] Add `scan_runs` usage + the manual scan action
8. [ ] Surface the scan summary on the dashboard
9. [ ] Tests: scan a temp dir; spy on `fs` to prove sensitive files are never read

## Done

Mark this phase complete only when all of the following hold:

- [ ] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [ ] **Verify:** `pnpm test` passes, including the never-read spy test and the ignored-dir test
- [ ] `git status` + `git diff --staged` reviewed; no scanned secret contents or DB files staged
- [ ] This file's **Status** changed to `Done`
- [ ] Committed locally, no push: `feat: Add metadata-only filesystem scanner`
