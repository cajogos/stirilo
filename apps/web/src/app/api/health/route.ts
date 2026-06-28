import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ status: "ok", app: "stirilo" });
}

export const dynamic = "force-dynamic";
