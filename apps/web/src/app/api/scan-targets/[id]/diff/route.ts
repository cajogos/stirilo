import { NextResponse } from "next/server";
import { requireAgent, jsonError } from "@/server/api";
import { getScanDiff } from "@/server/scan-diff";

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
  const diff = getScanDiff(id);
  if (!diff)
  {
    return jsonError("NOT_FOUND", "No completed scan for this target.", 404);
  }
  return NextResponse.json({ diff });
}

export const dynamic = "force-dynamic";
