import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { getSensitiveInventory } from "@/server/insights";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ sensitive: getSensitiveInventory() });
}

export const dynamic = "force-dynamic";
