import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { listGitRepositories } from "@/server/git-repos";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ repositories: listGitRepositories() });
}

export const dynamic = "force-dynamic";
