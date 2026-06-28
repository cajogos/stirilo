import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { listHealthSnapshots } from "@/server/health-history";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ trends: listHealthSnapshots() });
}

export const dynamic = "force-dynamic";
