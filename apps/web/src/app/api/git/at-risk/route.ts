import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { getGitAtRisk } from "@/server/git-intel";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ atRisk: getGitAtRisk() });
}

export const dynamic = "force-dynamic";
