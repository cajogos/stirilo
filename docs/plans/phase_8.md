# Phase 8: MCP Server v1

**Status:** Not started
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

- [ ] MCP server process under `packages/mcp/`
- [ ] HTTP API client wiring (uses agent token)
- [ ] Read-only tools listed above
- [ ] Configuration documentation

## Acceptance criteria

- [ ] Agent can call `stirilo_health`
- [ ] Agent can list scan targets
- [ ] Agent can list Git repositories
- [ ] Agent can get Git status
- [ ] MCP cannot execute commands

## Recommendations / Watch-outs

- Use the official **`@modelcontextprotocol/sdk`** over stdio for local agents, as a **thin pass-through** to the HTTP API (keeps auth/redaction/audit centralized).
- Reuse the Zod/OpenAPI source from Phase 7 for the tool schemas instead of hand-writing them.

## Safety notes

- MCP v1 is read-only; do not expose command execution.
- All access flows through the HTTP API so redaction/audit/auth remain centralized.
