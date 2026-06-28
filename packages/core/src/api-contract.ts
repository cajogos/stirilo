import {
  extendZodWithOpenApi,
  OpenApiGeneratorV31,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod with `.openapi()` so request/response schemas can carry metadata.
// This is the single source of truth for the HTTP API: the route handlers
// validate against these schemas, `docs/api.md` and `docs/openapi.json` are
// generated from them, and the MCP tools reuse the shared param shapes. They
// cannot drift because they all import from here.
extendZodWithOpenApi(z);

// ---------------------------------------------------------------------------
// Shared parameter + request body schemas (imported by route handlers + MCP).
// ---------------------------------------------------------------------------

export const idParamSchema = z.object({
  id: z.string().min(1).openapi({ example: "a1b2c3d4" }),
});

export const createScanTargetBodySchema = z
  .object({
    name: z.string().min(1).openapi({ example: "My projects" }),
    path: z.string().min(1).openapi({ example: "~/projects" }),
    confirm: z
      .boolean()
      .optional()
      .openapi({
        description:
          "Required (true) to add a sensitive or system path that is otherwise blocked.",
      }),
  })
  .openapi("CreateScanTargetBody");

export type CreateScanTargetBody = z.infer<typeof createScanTargetBodySchema>;

// The stable error envelope returned by every route on failure.
export const errorResponseSchema = z
  .object({
    error: z.object({
      code: z.string().openapi({ example: "VALIDATION_ERROR" }),
      message: z.string().openapi({ example: "Invalid request body." }),
      details: z.record(z.unknown()).openapi({ example: {} }),
    }),
  })
  .openapi("ErrorResponse");

// ---------------------------------------------------------------------------
// Route registry. One entry per endpoint; the doc/OpenAPI generators iterate it.
// ---------------------------------------------------------------------------

export interface ApiRouteDef
{
  method: "get" | "post";
  path: string;
  summary: string;
  // Whether the route requires the agent bearer token (all of them, in v0.1).
  auth: boolean;
  params?: z.ZodObject<z.ZodRawShape>;
  body?: z.ZodTypeAny;
  successStatus: number;
}

export const API_ROUTES: ApiRouteDef[] = [
  {
    method: "get",
    path: "/api/health",
    summary: "Liveness check.",
    auth: true,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/system/summary",
    summary: "Host info (hostname, platform, node, memory).",
    auth: true,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/scan-targets",
    summary: "List scan targets.",
    auth: true,
    successStatus: 200,
  },
  {
    method: "post",
    path: "/api/scan-targets",
    summary: "Create a scan target.",
    auth: true,
    body: createScanTargetBodySchema,
    successStatus: 201,
  },
  {
    method: "get",
    path: "/api/scan-targets/{id}",
    summary: "Get a scan target.",
    auth: true,
    params: idParamSchema,
    successStatus: 200,
  },
  {
    method: "post",
    path: "/api/scan-targets/{id}/scan",
    summary: "Run a scan; returns { runId, status }.",
    auth: true,
    params: idParamSchema,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/scan-targets/{id}/diff",
    summary: "Diff the two latest completed scans of a target.",
    auth: true,
    params: idParamSchema,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/scans",
    summary: "List scan runs.",
    auth: true,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/scans/{id}",
    summary: "Get a scan run (with summary).",
    auth: true,
    params: idParamSchema,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/git/repos",
    summary: "List detected Git repositories with latest status.",
    auth: true,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/git/repos/{id}",
    summary: "Get a Git repository.",
    auth: true,
    params: idParamSchema,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/git/repos/{id}/status",
    summary: "Get a repository's latest status snapshot.",
    auth: true,
    params: idParamSchema,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/git/at-risk",
    summary: "Cross-repo at-risk report: dirty, unpushed, no-remote, stale.",
    auth: true,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/insights/sensitive",
    summary: "Sensitive-file inventory (metadata only) across latest scans.",
    auth: true,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/insights/disk",
    summary: "Disk reclamation report: largest files/dirs, artifacts, stale.",
    auth: true,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/insights/duplicates",
    summary: "Potential duplicate files (grouped by size and name).",
    auth: true,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/insights/projects",
    summary: "Project/framework inventory across scanned targets.",
    auth: true,
    successStatus: 200,
  },
  {
    method: "get",
    path: "/api/audit-log",
    summary: "Recent audit entries.",
    auth: true,
    successStatus: 200,
  },
];

// Build an OpenAPI 3.1 document from the route registry. Used by the doc
// generator and exposed for any future machine-readable consumer.
export function buildOpenApiDocument(): ReturnType<
  OpenApiGeneratorV31["generateDocument"]
>
{
  const registry = new OpenAPIRegistry();
  const bearer = registry.registerComponent("securitySchemes", "agentToken", {
    type: "http",
    scheme: "bearer",
    description: "Matches STIRILO_AGENT_TOKEN, compared in constant time.",
  });

  for (const route of API_ROUTES)
  {
    registry.registerPath({
      method: route.method,
      path: route.path,
      summary: route.summary,
      security: route.auth ? [{ [bearer.name]: [] }] : [],
      request: {
        ...(route.params ? { params: route.params } : {}),
        ...(route.body
          ? {
              body: {
                content: { "application/json": { schema: route.body } },
              },
            }
          : {}),
      },
      responses: {
        [route.successStatus]: {
          description: "Success.",
          content: {
            "application/json": { schema: z.record(z.unknown()) },
          },
        },
        "400": {
          description: "Validation error.",
          content: { "application/json": { schema: errorResponseSchema } },
        },
        "401": {
          description: "Missing or invalid agent token.",
          content: { "application/json": { schema: errorResponseSchema } },
        },
      },
    });
  }

  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Stirilo HTTP API",
      version: "0.1.0",
      description:
        "Local, authenticated, read-first JSON API. All routes authenticate " +
        "with the agent token and never return secrets.",
    },
    servers: [{ url: "http://localhost:3157" }],
  });
}
