import "server-only";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { scanRuns } from "@stirilo/db";
import type { SensitiveMarker } from "@stirilo/scanner";
import { getDb } from "@/server/db";
import type { ScanSummary } from "@/server/scans";

export interface ScanDiff
{
  hasPrevious: boolean;
  currentAt: string;
  previousAt: string | null;
  fileCountDelta: number;
  totalSizeDelta: number;
  reclaimableDelta: number;
  addedSensitive: SensitiveMarker[];
  removedSensitive: SensitiveMarker[];
}

function lastTwoCompleted(targetId: string):
  { startedAt: string; summary: ScanSummary }[]
{
  const rows = getDb()
    .select({ startedAt: scanRuns.startedAt, summaryJson: scanRuns.summaryJson })
    .from(scanRuns)
    .where(
      and(
        eq(scanRuns.scanTargetId, targetId),
        eq(scanRuns.status, "completed"),
        isNotNull(scanRuns.summaryJson),
      ),
    )
    .orderBy(desc(scanRuns.startedAt))
    .limit(2)
    .all();

  const out: { startedAt: string; summary: ScanSummary }[] = [];
  for (const row of rows)
  {
    if (!row.summaryJson)
    {
      continue;
    }
    try
    {
      out.push({
        startedAt: row.startedAt,
        summary: JSON.parse(row.summaryJson) as ScanSummary,
      });
    }
    catch
    {
      // Skip an unparseable summary.
    }
  }
  return out;
}

// Diff the two most recent completed scans of a target. Metadata only: it never
// inspects file contents, just compares the stored summaries.
export function getScanDiff(targetId: string): ScanDiff | null
{
  const runs = lastTwoCompleted(targetId);
  const current = runs[0];
  if (!current)
  {
    return null;
  }
  const previous = runs[1] ?? null;

  if (!previous)
  {
    return {
      hasPrevious: false,
      currentAt: current.startedAt,
      previousAt: null,
      fileCountDelta: 0,
      totalSizeDelta: 0,
      reclaimableDelta: 0,
      addedSensitive: [],
      removedSensitive: [],
    };
  }

  const curMarkers = new Map(
    (current.summary.sensitiveMarkers ?? []).map((m) => [m.path, m]),
  );
  const prevMarkers = new Map(
    (previous.summary.sensitiveMarkers ?? []).map((m) => [m.path, m]),
  );

  const addedSensitive: SensitiveMarker[] = [];
  for (const [path, marker] of curMarkers)
  {
    if (!prevMarkers.has(path))
    {
      addedSensitive.push(marker);
    }
  }
  const removedSensitive: SensitiveMarker[] = [];
  for (const [path, marker] of prevMarkers)
  {
    if (!curMarkers.has(path))
    {
      removedSensitive.push(marker);
    }
  }

  return {
    hasPrevious: true,
    currentAt: current.startedAt,
    previousAt: previous.startedAt,
    fileCountDelta:
      (current.summary.fileCount ?? 0) - (previous.summary.fileCount ?? 0),
    totalSizeDelta:
      (current.summary.totalSize ?? 0) - (previous.summary.totalSize ?? 0),
    reclaimableDelta:
      (current.summary.reclaimableBytes ?? 0) -
      (previous.summary.reclaimableBytes ?? 0),
    addedSensitive,
    removedSensitive,
  };
}
