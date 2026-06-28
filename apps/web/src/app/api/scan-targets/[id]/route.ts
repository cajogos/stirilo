import { NextResponse } from "next/server";
import { requireAgent, jsonError } from "@/server/api";
import { getScanTargetById } from "@/server/scan-targets";

export async function GET(
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
  const target = getScanTargetById(id);
  if (!target)
  {
    return jsonError("NOT_FOUND", "Scan target not found.", 404);
  }
  return NextResponse.json({ scanTarget: target });
}

export const dynamic = "force-dynamic";
