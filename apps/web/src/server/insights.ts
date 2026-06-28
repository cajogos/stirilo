import "server-only";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { scanRuns } from "@stirilo/db";
import type {
  ArtifactDirEntry,
  DirSizeEntry,
  DuplicateGroup,
  FileSizeEntry,
  RecentFileEntry,
  SensitiveMarker,
} from "@stirilo/scanner";
import { getDb } from "@/server/db";
import { listScanTargets } from "@/server/scan-targets";
import type { ScanSummary } from "@/server/scans";

// The latest completed scan summary for a single target, with target context.
export interface TargetSummary
{
  targetId: string;
  targetName: string;
  targetPath: string;
  scannedAt: string;
  summary: ScanSummary;
}

function latestCompletedRunForTarget(targetId: string):
  | { startedAt: string; summaryJson: string | null }
  | null
{
  const rows = getDb()
    .select({
      startedAt: scanRuns.startedAt,
      summaryJson: scanRuns.summaryJson,
    })
    .from(scanRuns)
    .where(
      and(
        eq(scanRuns.scanTargetId, targetId),
        eq(scanRuns.status, "completed"),
        isNotNull(scanRuns.summaryJson),
      ),
    )
    .orderBy(desc(scanRuns.startedAt))
    .limit(1)
    .all();
  return rows[0] ?? null;
}

// Latest completed summary per target. The basis for every insight report so
// each reflects current state (one run per target), not stale history.
export function getLatestSummariesPerTarget(): TargetSummary[]
{
  const out: TargetSummary[] = [];
  for (const target of listScanTargets())
  {
    const run = latestCompletedRunForTarget(target.id);
    if (!run?.summaryJson)
    {
      continue;
    }
    let summary: ScanSummary;
    try
    {
      summary = JSON.parse(run.summaryJson) as ScanSummary;
    }
    catch
    {
      continue;
    }
    out.push({
      targetId: target.id,
      targetName: target.name,
      targetPath: target.path,
      scannedAt: run.startedAt,
      summary,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Sensitive-file inventory (metadata only - path/size/mtime/rule).
// ---------------------------------------------------------------------------

export interface SensitiveGroup
{
  targetId: string;
  targetName: string;
  targetPath: string;
  markers: SensitiveMarker[];
}

export interface SensitiveInventory
{
  totalCount: number;
  byRule: { rule: string; count: number }[];
  groups: SensitiveGroup[];
}

export function getSensitiveInventory(): SensitiveInventory
{
  const groups: SensitiveGroup[] = [];
  const ruleCounts = new Map<string, number>();
  let totalCount = 0;

  for (const t of getLatestSummariesPerTarget())
  {
    const markers = t.summary.sensitiveMarkers ?? [];
    if (markers.length === 0)
    {
      continue;
    }
    totalCount += markers.length;
    for (const m of markers)
    {
      ruleCounts.set(m.rule, (ruleCounts.get(m.rule) ?? 0) + 1);
    }
    groups.push({
      targetId: t.targetId,
      targetName: t.targetName,
      targetPath: t.targetPath,
      markers: [...markers].sort((a, b) => a.path.localeCompare(b.path)),
    });
  }

  const byRule = [...ruleCounts.entries()]
    .map(([rule, count]) => ({ rule, count }))
    .sort((a, b) => b.count - a.count);

  return { totalCount, byRule, groups };
}

// ---------------------------------------------------------------------------
// Disk reclamation report.
// ---------------------------------------------------------------------------

export interface DiskReport
{
  totalSize: number;
  reclaimableBytes: number;
  largestFiles: (FileSizeEntry & { target: string })[];
  largestDirectories: (DirSizeEntry & { target: string })[];
  artifactDirectories: (ArtifactDirEntry & { target: string })[];
  staleFiles: (RecentFileEntry & { target: string })[];
  hasData: boolean;
}

export function getDiskReport(): DiskReport
{
  const summaries = getLatestSummariesPerTarget();
  let totalSize = 0;
  let reclaimableBytes = 0;
  const largestFiles: (FileSizeEntry & { target: string })[] = [];
  const largestDirectories: (DirSizeEntry & { target: string })[] = [];
  const artifactDirectories: (ArtifactDirEntry & { target: string })[] = [];
  const staleFiles: (RecentFileEntry & { target: string })[] = [];

  for (const t of summaries)
  {
    totalSize += t.summary.totalSize ?? 0;
    reclaimableBytes += t.summary.reclaimableBytes ?? 0;
    for (const f of t.summary.largestFiles ?? [])
    {
      largestFiles.push({ ...f, target: t.targetName });
    }
    for (const d of t.summary.largestDirectories ?? [])
    {
      largestDirectories.push({ ...d, target: t.targetName });
    }
    for (const a of t.summary.artifactDirectories ?? [])
    {
      artifactDirectories.push({ ...a, target: t.targetName });
    }
    for (const s of t.summary.staleFiles ?? [])
    {
      staleFiles.push({ ...s, target: t.targetName });
    }
  }

  largestFiles.sort((a, b) => b.size - a.size);
  largestDirectories.sort((a, b) => b.size - a.size);
  artifactDirectories.sort((a, b) => b.size - a.size);
  staleFiles.sort((a, b) => a.modifiedAt.localeCompare(b.modifiedAt));

  return {
    totalSize,
    reclaimableBytes,
    largestFiles: largestFiles.slice(0, 20),
    largestDirectories: largestDirectories.slice(0, 20),
    artifactDirectories: artifactDirectories.slice(0, 20),
    staleFiles: staleFiles.slice(0, 20),
    hasData: summaries.length > 0,
  };
}

// ---------------------------------------------------------------------------
// Duplicate report (metadata-only candidates: same size + filename).
// ---------------------------------------------------------------------------

export interface DuplicateReport
{
  groups: (DuplicateGroup & { target: string })[];
  totalWastedBytes: number;
  hasData: boolean;
}

export function getDuplicateReport(): DuplicateReport
{
  const summaries = getLatestSummariesPerTarget();
  const groups: (DuplicateGroup & { target: string })[] = [];
  let totalWastedBytes = 0;

  for (const t of summaries)
  {
    for (const g of t.summary.potentialDuplicates ?? [])
    {
      groups.push({ ...g, target: t.targetName });
      totalWastedBytes += g.wastedBytes;
    }
  }
  groups.sort((a, b) => b.wastedBytes - a.wastedBytes);

  return {
    groups: groups.slice(0, 50),
    totalWastedBytes,
    hasData: summaries.length > 0,
  };
}

// ---------------------------------------------------------------------------
// Project / framework inventory.
// ---------------------------------------------------------------------------

export interface ProjectInventory
{
  markers: { marker: string; targets: string[] }[];
  hasData: boolean;
}

export function getProjectInventory(): ProjectInventory
{
  const summaries = getLatestSummariesPerTarget();
  const map = new Map<string, Set<string>>();

  for (const t of summaries)
  {
    for (const marker of t.summary.projectMarkers ?? [])
    {
      const set = map.get(marker) ?? new Set<string>();
      set.add(t.targetName);
      map.set(marker, set);
    }
  }

  const markers = [...map.entries()]
    .map(([marker, targets]) => ({ marker, targets: [...targets].sort() }))
    .sort((a, b) => b.targets.length - a.targets.length);

  return { markers, hasData: summaries.length > 0 };
}
