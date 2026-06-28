import { NextResponse } from "next/server";
import { requireAgent } from "@/server/api";
import { runDueSchedules } from "@/server/schedules";

// Run any due schedules. Intended to be called on a cadence by a system cron
// (or any caller holding the agent token), e.g. every minute:
//   * * * * * curl -fsS -X POST -H "Authorization: Bearer $TOKEN" \
//     http://127.0.0.1:3157/api/cron/tick
// No browser session is required. Returns how many scans were started.
export async function POST(request: Request): Promise<NextResponse>
{
  const denied = requireAgent(request);
  if (denied)
  {
    return denied;
  }
  const started = await runDueSchedules("agent");
  return NextResponse.json({ started });
}

export const dynamic = "force-dynamic";
