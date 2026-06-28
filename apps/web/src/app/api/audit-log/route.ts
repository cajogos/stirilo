import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { listAuditEntries } from "@/server/audit-log";

export async function GET(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  return NextResponse.json({ auditLog: listAuditEntries() });
}

export const dynamic = "force-dynamic";
