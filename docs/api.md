# Stirilo HTTP API

A local, authenticated, read-first JSON API. All routes are served by the Next.js
app under `/api` and bypass the session middleware (they authenticate with an
agent token instead).

## Authentication

Every request requires a bearer token matching `STIRILO_AGENT_TOKEN`:

```
Authorization: Bearer <STIRILO_AGENT_TOKEN>
```

The token is compared in constant time. Requests without a valid token receive
`401`. If `STIRILO_AGENT_TOKEN` is not configured, the API returns `503`.

## Error shape

All errors use a stable envelope:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid request body.", "details": {} } }
```

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Liveness check (`{ status: "ok" }`) |
| GET | `/api/system/summary` | Host info (hostname, platform, node, memory) |
| GET | `/api/scan-targets` | List scan targets |
| POST | `/api/scan-targets` | Create a scan target |
| GET | `/api/scan-targets/:id` | Get a scan target |
| POST | `/api/scan-targets/:id/scan` | Run a scan; returns `{ runId, status }` |
| GET | `/api/scans` | List scan runs |
| GET | `/api/scans/:id` | Get a scan run (with summary) |
| GET | `/api/git/repos` | List detected Git repositories with latest status |
| GET | `/api/git/repos/:id` | Get a Git repository |
| GET | `/api/git/repos/:id/status` | Get a repository's latest status snapshot |
| GET | `/api/audit-log` | Recent audit entries |

### POST /api/scan-targets

Request body (validated with Zod):

```json
{ "name": "My projects", "path": "~/projects", "confirm": false }
```

Responses: `201 { "id", "path" }`; `400 VALIDATION_ERROR`; `409 DUPLICATE`. A
sensitive or system path requires `"confirm": true`.

## Guarantees

- Secrets are never returned: no `.env` contents, no raw session data, no agent
  token, no environment variables.
- Mutating actions (create scan target, run scan) are recorded in the audit log.
- Responses are structured JSON suitable for AI agents.

> Note: schemas are currently hand-written. Generating this document and the MCP
> tool schemas from a shared Zod/OpenAPI source is a planned improvement.
