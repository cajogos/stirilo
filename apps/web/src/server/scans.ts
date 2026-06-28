import "server-only";
import { desc, eq } from "drizzle-orm";
import { scanRuns, type ScanRun } from "@stirilo/db";
import type { ScanResult } from "@stirilo/scanner";
import { getDb } from "@/server/db";

export type ScanSummary = ScanResult;

export function getLatestScanRunForTarget(targetId: string): ScanRun | null
{
  const rows = getDb()
    .select()
    .from(scanRuns)
    .where(eq(scanRuns.scanTargetId, targetId))
    .orderBy(desc(scanRuns.startedAt))
    .limit(1)
    .all();
  return rows[0] ?? null;
}

export function getLatestScanRun(): ScanRun | null
{
  const rows = getDb()
    .select()
    .from(scanRuns)
    .orderBy(desc(scanRuns.startedAt))
    .limit(1)
    .all();
  return rows[0] ?? null;
}

export function parseSummary(run: ScanRun | null): ScanSummary | null
{
  if (!run?.summaryJson)
  {
    return null;
  }
  try
  {
    return JSON.parse(run.summaryJson) as ScanSummary;
  }
  catch
  {
    return null;
  }
}
