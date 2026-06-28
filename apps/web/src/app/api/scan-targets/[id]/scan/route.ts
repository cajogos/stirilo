import { NextResponse } from "next/server";
import { requireAgent, jsonError } from "@/server/api";
import { executeScan } from "@/server/services/scan-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }

  const { id } = await params;
  const result = await executeScan("agent", id);
  if (!result.ok)
  {
    return jsonError(result.code, result.message, 404);
  }

  return NextResponse.json({ runId: result.runId, status: result.status });
}

export const dynamic = "force-dynamic";
