import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { hitRateLimit, loadConfig, type RateWindow } from "@stirilo/core";

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

// In-memory fixed-window rate limiting, keyed by a hash of the presented token
// so the raw token is never stored. The app is a single Node process, so an
// in-memory store is sufficient. Configurable via STIRILO_RATE_LIMIT_PER_MIN.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = Number(process.env.STIRILO_RATE_LIMIT_PER_MIN ?? 300);
const rateStore = new Map<string, RateWindow>();

function enforceRateLimit(tokenKey: string): NextResponse | null
{
  const now = Date.now();
  const { window, limited } = hitRateLimit(
    rateStore.get(tokenKey),
    now,
    RATE_MAX,
    RATE_WINDOW_MS,
  );
  rateStore.set(tokenKey, window);
  if (limited)
  {
    return jsonError("RATE_LIMITED", "Too many requests; slow down.", 429, {
      limitPerMinute: RATE_MAX,
    });
  }
  return null;
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

  // Rate-limit authenticated callers, keyed by the token hash (never the raw
  // token). Unauthenticated requests are rejected above and never counted.
  return enforceRateLimit(provided.toString("hex"));
}
