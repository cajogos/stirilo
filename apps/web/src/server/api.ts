import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { loadConfig } from "@stirilo/core";

// Stable error envelope shared by every API route.
export function jsonError(
  code: string,
  message: string,
  status: number,
  details: Record<string, unknown> = {},
): NextResponse
{
  return NextResponse.json({ error: { code, message, details } }, { status });
}

// Authenticate a request with the agent token (Bearer), compared in constant
// time. Returns a NextResponse to short-circuit on failure, or null if allowed.
export function requireAgent(request: Request): NextResponse | null
{
  const expected = loadConfig().STIRILO_AGENT_TOKEN;
  if (!expected)
  {
    return jsonError(
      "API_NOT_CONFIGURED",
      "STIRILO_AGENT_TOKEN is not configured.",
      503,
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match)
  {
    return jsonError("UNAUTHORIZED", "Missing bearer token.", 401);
  }

  const provided = createHash("sha256").update(match[1] ?? "").digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  if (!timingSafeEqual(provided, expectedHash))
  {
    return jsonError("UNAUTHORIZED", "Invalid agent token.", 401);
  }

  return null;
}
