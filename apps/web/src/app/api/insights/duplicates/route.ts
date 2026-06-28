import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { getDuplicateReport } from "@/server/insights";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ duplicates: getDuplicateReport() });
}

export const dynamic = "force-dynamic";
