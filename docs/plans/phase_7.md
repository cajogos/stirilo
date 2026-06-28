# Phase 7: HTTP API v1

**Status:** Done
**Depends on:** Phase 6
**PRD reference:** Milestone 7, Implementation Order step 12

## Goal

An authenticated, read-first local HTTP API that exposes Stirilo's data with a stable, structured JSON contract, suitable for AI agents.

## In scope

- Agent token support (`STIRILO_AGENT_TOKEN`, separate from the user session)
- Endpoints:
  - `GET /api/health`
  - `GET /api/system/summary`
  - `GET /api/scan-targets`
  - `POST /api/scan-targets`
  - `GET /api/scan-targets/:id`
  - `POST /api/scan-targets/:id/scan`
  - `GET /api/scans`
  - `GET /api/scans/:id`
  - `GET /api/git/repos`
  - `GET /api/git/repos/:id`
  - `GET /api/git/repos/:id/status`
  - `GET /api/audit-log`
- Zod validation on all inputs
- Stable error shape: `{ "error": { "code", "message", "details" } }`
- Audit logging for mutating actions

## Out of scope

- MCP server (Phase 8)
- Command execution endpoints (not in v0.1)

## Deliverables

- [x] Agent token auth middleware
- [x] All routes above
- [x] Zod validation + stable error format
- [x] Audit logging on mutations (`API token used`, `scan started`, etc.)

## Acceptance criteria

- [x] API rejects unauthenticated requests
- [x] API accepts a valid agent token
- [x] API never returns secrets
- [x] API returns structured JSON
- [x] API tests pass

## Recommendations / Watch-outs

- **Share the service layer with the UI's server actions** - the API must not reimplement scan/git logic. One source of truth, validated once.
- **Centralize the error shape** in one handler/middleware; **constant-time compare** the agent token via a Bearer header.
- Use **`zod-to-openapi`** to auto-generate `docs/api.md` and to feed the Phase 8 MCP tool schemas from one Zod source.
- **Audit mutations only** (not every read) to avoid noisy `API token used` entries per request.

## Safety notes

- Do not expose secrets, `.env` contents, raw session data, or raw agent tokens.
- Use structured responses suitable for AI agents.
- Apply redaction to any field that could carry secret-like data.

## Implementation Checklist

1. [x] Extract a shared service layer used by both UI server actions and the API
2. [x] Add agent-token auth middleware (Bearer header, constant-time compare)
3. [x] Implement the routes: health, system/summary, scan-targets (list/create/get/scan), scans, git repos/status, audit-log
4. [x] Add Zod validation + a centralized error-shape handler
5. [x] Document the API in `docs/api.md` (hand-written; zod-to-openapi auto-gen deferred)
6. [x] Audit mutating actions only
7. [x] Tests: unauth rejected, valid token accepted, no secrets returned, structured JSON

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** `pnpm test` passes; API rejects unauth requests, accepts a valid token, never returns secrets
- [x] `git status` + `git diff --staged` reviewed; no agent token or secrets staged
- [x] This file's **Status** changed to `Done`
- [x] Committed locally, no push: `feat: Add authenticated HTTP API`
