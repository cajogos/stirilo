import { NextResponse } from "next/server";
import { requireAgent, jsonError } from "@/server/api";
import { getGitRepository } from "@/server/git-repos";

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
  const entry = getGitRepository(id);
  if (!entry)
  {
    return jsonError("NOT_FOUND", "Git repository not found.", 404);
  }
  return NextResponse.json({ repository: entry.repo, status: entry.status });
}

export const dynamic = "force-dynamic";
