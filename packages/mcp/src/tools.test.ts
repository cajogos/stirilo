import { describe, expect, it } from "vitest";
import type { ApiClient } from "./api.js";
import { createTools } from "./tools.js";

function stubClient(routes: Record<string, unknown>): ApiClient
{
  return {
    async get(path: string)
    {
      if (!(path in routes))
      {
        throw new Error(`unexpected path ${path}`);
      }
      return routes[path];
    },
  };
}

describe("createTools", () =>
{
  it("exposes only read-only tools and no command execution", () =>
  {
    const names = createTools(stubClient({})).map((t) => t.name);
    expect(names).toContain("stirilo_health");
    expect(names).toContain("stirilo_list_scan_targets");
    expect(names).toContain("stirilo_list_git_repositories");
    expect(names).toContain("stirilo_get_git_status");
    expect(names).toContain("stirilo_git_at_risk");
    expect(names).toContain("stirilo_sensitive_inventory");
    expect(names).toContain("stirilo_health_trends");
    // No tool may execute commands.
    expect(names.some((n) => /exec|run.?command|shell/i.test(n))).toBe(false);
  });

  it("stirilo_health calls the health endpoint", async () =>
  {
    const tools = createTools(stubClient({ "/api/health": { status: "ok" } }));
    const health = tools.find((t) => t.name === "stirilo_health");
    const result = await health!.handler({});
    expect(result.content[0]?.text).toContain("ok");
  });

  it("stirilo_find_sensitive_file_markers extracts markers from the latest scan", async () =>
  {
    const summary = { sensitiveMarkers: [{ path: ".env", rule: "env-file" }] };
    const tools = createTools(
      stubClient({
        "/api/scans": {
          scans: [{ status: "completed", summaryJson: JSON.stringify(summary) }],
        },
      }),
    );
    const tool = tools.find(
      (t) => t.name === "stirilo_find_sensitive_file_markers",
    );
    const result = await tool!.handler({});
    expect(result.content[0]?.text).toContain("env-file");
  });
});
