# Phase 8: MCP Server v1

**Status:** Done
**Depends on:** Phase 7
**PRD reference:** Milestone 8, Implementation Order step 13

## Goal

A read-only MCP server that lets AI agents query local system state safely, by talking to the Stirilo HTTP API rather than the database directly.

## In scope

- `packages/mcp/`
- MCP server process
- Connects to the Stirilo HTTP API (not the DB directly, so auth/audit/redaction/permission checks stay centralized)
- Read-only tools:
  - `stirilo_health`
  - `stirilo_system_summary`
  - `stirilo_list_scan_targets`
  - `stirilo_get_scan_target`
  - `stirilo_get_recent_scan_results`
  - `stirilo_list_git_repositories`
  - `stirilo_get_git_status`
  - `stirilo_find_large_files`
  - `stirilo_find_sensitive_file_markers`
- Configuration docs

## Out of scope

- Any command execution tool (explicitly excluded from MCP v1)
- Direct database access

## Deliverables

- [x] MCP server process under `packages/mcp/`
- [x] HTTP API client wiring (uses agent token)
- [x] Read-only tools listed above
- [x] Configuration documentation

## Acceptance criteria

- [x] Agent can call `stirilo_health`
- [x] Agent can list scan targets
- [x] Agent can list Git repositories
- [x] Agent can get Git status
- [x] MCP cannot execute commands

## Recommendations / Watch-outs

- Use the official **`@modelcontextprotocol/sdk`** over stdio for local agents, as a **thin pass-through** to the HTTP API (keeps auth/redaction/audit centralized).
- Reuse the Zod/OpenAPI source from Phase 7 for the tool schemas instead of hand-writing them.

## Safety notes

- MCP v1 is read-only; do not expose command execution.
- All access flows through the HTTP API so redaction/audit/auth remain centralized.

## Implementation Checklist

1. [x] Create `packages/mcp` using `@modelcontextprotocol/sdk` over stdio
2. [x] Add an HTTP API client (agent token) for the server
3. [x] Implement the read-only tools, reusing the Phase 7 Zod/OpenAPI schemas
4. [x] Write the configuration docs (`docs/mcp.md`)
5. [x] Tests: agent can call health, list scan targets, list repos, get git status; no command execution exists

## Done

Mark this phase complete only when all of the following hold:

- [x] Every box in **Deliverables**, **Implementation Checklist**, and **Acceptance criteria** is checked
- [x] **Verify:** `pnpm test` passes; an MCP client can call the read-only tools and cannot execute commands
- [x] `git status` + `git diff --staged` reviewed; no agent token or secrets staged
- [x] This file's **Status** changed to `Done`
- [x] Committed locally, no push: `feat: Add read-only MCP server`
