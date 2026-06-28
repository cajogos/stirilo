import { type ZodRawShape } from "zod";
import { idParamSchema } from "@stirilo/core";
import type { ApiClient } from "./api.js";

export interface ToolResult
{
  content: { type: "text"; text: string }[];
  [key: string]: unknown;
}

export interface ToolDef
{
  name: string;
  description: string;
  schema: ZodRawShape;
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

function text(value: unknown): ToolResult
{
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

interface ScanRunRow
{
  status: string;
  summaryJson: string | null;
}

// Find the most recent completed scan summary, parsed.
async function latestSummary(
  client: ApiClient,
): Promise<Record<string, unknown> | null>
{
  const data = (await client.get("/api/scans")) as { scans?: ScanRunRow[] };
  const run = (data.scans ?? []).find(
    (s) => s.status === "completed" && s.summaryJson,
  );
  if (!run?.summaryJson)
  {
    return null;
  }
  try
  {
    return JSON.parse(run.summaryJson) as Record<string, unknown>;
  }
  catch
  {
    return null;
  }
}

// All MCP tools are read-only. There is deliberately no command-execution tool.
export function createTools(client: ApiClient): ToolDef[]
{
  return [
    {
      name: "stirilo_health",
      description: "Check that the Stirilo service is healthy.",
      schema: {},
      handler: async () => text(await client.get("/api/health")),
    },
    {
      name: "stirilo_system_summary",
      description: "Get read-only host system information.",
      schema: {},
      handler: async () => text(await client.get("/api/system/summary")),
    },
    {
      name: "stirilo_list_scan_targets",
      description: "List the configured directory scan targets.",
      schema: {},
      handler: async () => text(await client.get("/api/scan-targets")),
    },
    {
      name: "stirilo_get_scan_target",
      description: "Get a single scan target by id.",
      schema: idParamSchema.shape,
      handler: async (args) =>
        text(await client.get(`/api/scan-targets/${String(args.id)}`)),
    },
    {
      name: "stirilo_get_recent_scan_results",
      description: "List recent scan runs and their summaries.",
      schema: {},
      handler: async () => text(await client.get("/api/scans")),
    },
    {
      name: "stirilo_list_git_repositories",
      description: "List detected Git repositories with their latest status.",
      schema: {},
      handler: async () => text(await client.get("/api/git/repos")),
    },
    {
      name: "stirilo_get_git_status",
      description: "Get the latest status snapshot for a Git repository by id.",
      schema: idParamSchema.shape,
      handler: async (args) =>
        text(await client.get(`/api/git/repos/${String(args.id)}/status`)),
    },
    {
      name: "stirilo_find_large_files",
      description: "List the largest files from the most recent scan.",
      schema: {},
      handler: async () =>
      {
        const summary = await latestSummary(client);
        return text(summary?.largestFiles ?? []);
      },
    },
    {
      name: "stirilo_find_sensitive_file_markers",
      description:
        "List sensitive file markers (metadata only) from the most recent scan.",
      schema: {},
      handler: async () =>
      {
        const summary = await latestSummary(client);
        return text(summary?.sensitiveMarkers ?? []);
      },
    },
  ];
}
