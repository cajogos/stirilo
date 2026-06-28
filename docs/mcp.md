# Stirilo MCP Server

`@stirilo/mcp` exposes Stirilo's read-only data to AI agents via the Model
Context Protocol over stdio. It is a thin client that calls the Stirilo HTTP API,
so authentication, auditing, and redaction remain centralized in the app.

## Prerequisites

- The Stirilo web app must be running (the API is served by it).
- A configured `STIRILO_AGENT_TOKEN`.

## Configuration

The server reads two environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `STIRILO_APP_URL` | `http://localhost:3157` | Base URL of the Stirilo HTTP API |
| `STIRILO_AGENT_TOKEN` | (required) | Bearer token for the API |

## Running

```bash
pnpm --filter @stirilo/mcp build
STIRILO_APP_URL=http://localhost:3157 STIRILO_AGENT_TOKEN=... node packages/mcp/dist/server.js
```

### Claude Desktop example

```json
{
  "mcpServers": {
    "stirilo": {
      "command": "node",
      "args": ["/absolute/path/to/stirilo/packages/mcp/dist/server.js"],
      "env": {
        "STIRILO_APP_URL": "http://localhost:3157",
        "STIRILO_AGENT_TOKEN": "your-agent-token"
      }
    }
  }
}
```

## Tools (all read-only)

- `stirilo_health`
- `stirilo_system_summary`
- `stirilo_list_scan_targets`
- `stirilo_get_scan_target`
- `stirilo_get_recent_scan_results`
- `stirilo_list_git_repositories`
- `stirilo_get_git_status`
- `stirilo_find_large_files`
- `stirilo_find_sensitive_file_markers`
- `stirilo_sensitive_inventory`
- `stirilo_disk_report`
- `stirilo_find_duplicates`
- `stirilo_project_inventory`
- `stirilo_git_at_risk`
- `stirilo_health_trends`
- `stirilo_scan_diff`

There is deliberately no command-execution tool. The MCP server cannot run
commands, write files, or change settings.
