# Phase 7: HTTP API v1

**Status:** Not started
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

- [ ] Agent token auth middleware
- [ ] All routes above
- [ ] Zod validation + stable error format
- [ ] Audit logging on mutations (`API token used`, `scan started`, etc.)

## Acceptance criteria

- [ ] API rejects unauthenticated requests
- [ ] API accepts a valid agent token
- [ ] API never returns secrets
- [ ] API returns structured JSON
- [ ] API tests pass

## Safety notes

- Do not expose secrets, `.env` contents, raw session data, or raw agent tokens.
- Use structured responses suitable for AI agents.
- Apply redaction to any field that could carry secret-like data.
