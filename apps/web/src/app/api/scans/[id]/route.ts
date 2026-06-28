import { NextResponse } from "next/server";
import { requireAgent, jsonError } from "@/server/api";
import { getScanRunById } from "@/server/scans";

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
  const scan = getScanRunById(id);
  if (!scan)
  {
    return jsonError("NOT_FOUND", "Scan run not found.", 404);
  }
  return NextResponse.json({ scan });
}

export const dynamic = "force-dynamic";
