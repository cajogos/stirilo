import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { listScanRuns } from "@/server/scans";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ scans: listScanRuns() });
}

export const dynamic = "force-dynamic";
