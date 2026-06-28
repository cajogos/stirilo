import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { getSystemSummary } from "@/server/system";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ system: getSystemSummary() });
}

export const dynamic = "force-dynamic";
