import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { getDiskReport } from "@/server/insights";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ disk: getDiskReport() });
}

export const dynamic = "force-dynamic";
