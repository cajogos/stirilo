#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createApiClient } from "./api.js";
import { createTools } from "./tools.js";

async function main(): Promise<void>
{
  const baseUrl = process.env.STIRILO_APP_URL ?? "http://localhost:3157";
  const token = process.env.STIRILO_AGENT_TOKEN ?? "";

  const client = createApiClient(baseUrl, token);
  const server = new McpServer({ name: "stirilo", version: "0.1.0" });

  for (const tool of createTools(client))
  {
    server.tool(tool.name, tool.description, tool.schema, tool.handler);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) =>
{
  console.error(error);
  process.exit(1);
});
