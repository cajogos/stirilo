import "server-only";
import { sql } from "drizzle-orm";
import { scanTargets } from "@stirilo/db";
import { getDb } from "@/server/db";
import { listGitRepositories } from "@/server/git-repos";
import { getLatestScanRun, parseSummary } from "@/server/scans";

export interface DashboardData
{
  scanTargetCount: number;
  repoCount: number;
  dirtyRepoCount: number;
  lastScanStatus: string | null;
  sensitiveMarkerCount: number;
  fileCount: number;
  totalSize: number;
  largestFile: { path: string; size: number } | null;
  recentFile: { path: string; modifiedAt: string } | null;
  hasData: boolean;
}

function countScanTargets(): number
{
  const rows = getDb()
    .select({ value: sql<number>`count(*)` })
    .from(scanTargets)
    .all();
  return Number(rows[0]?.value ?? 0);
}

// Aggregate dashboard figures in the server/db layer (no client recomputation).
export function getDashboardData(): DashboardData
{
  const scanTargetCount = countScanTargets();
  const repos = listGitRepositories();
  const repoCount = repos.length;
  const dirtyRepoCount = repos.filter((r) => r.status?.isDirty).length;

  const latest = getLatestScanRun();
  const summary = parseSummary(latest);

  return {
    scanTargetCount,
    repoCount,
    dirtyRepoCount,
    lastScanStatus: latest?.status ?? null,
    sensitiveMarkerCount: summary?.sensitiveMarkers.length ?? 0,
    fileCount: summary?.fileCount ?? 0,
    totalSize: summary?.totalSize ?? 0,
    largestFile: summary?.largestFiles[0] ?? null,
    recentFile: summary?.recentFiles[0] ?? null,
    hasData: scanTargetCount > 0 || latest !== null,
  };
}
