import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAgent, jsonError } from "@/server/api";
import { listScanTargets } from "@/server/scan-targets";
import { createScanTargetRecord } from "@/server/services/scan-targets-service";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ scanTargets: listScanTargets() });
}

const createSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  confirm: z.boolean().optional(),
});

export async function POST(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }

  let body: unknown;
  try
  {
    body = await request.json();
  }
  catch
  {
    return jsonError("VALIDATION_ERROR", "Request body must be JSON.", 400);
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
  {
    return jsonError("VALIDATION_ERROR", "Invalid request body.", 400, {
      issues: parsed.error.issues,
    });
  }

  const result = createScanTargetRecord({
    name: parsed.data.name,
    path: parsed.data.path,
    confirm: parsed.data.confirm ?? false,
    actor: "agent",
  });

  if (!result.ok)
  {
    const status = result.code === "DUPLICATE" ? 409 : 400;
    return jsonError(result.code, result.message, status);
  }

  return NextResponse.json(
    { id: result.id, path: result.path },
    { status: 201 },
  );
}

export const dynamic = "force-dynamic";
