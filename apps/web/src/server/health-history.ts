import "server-only";
import { randomUUID } from "node:crypto";
import os from "node:os";
import { statfs } from "node:fs/promises";
import { desc, lt } from "drizzle-orm";
import {
  gitStatusSnapshots,
  healthSnapshots,
  scanRuns,
  type HealthSnapshot,
} from "@stirilo/db";
import { getDb } from "@/server/db";
import { getNumberSetting, SETTING_KEYS } from "@/server/settings";

async function diskUsage(path = "/"): Promise<{ total: number; free: number }>
{
  try
  {
    const s = await statfs(path);
    // bavail = blocks available to unprivileged users (the usable free space).
    return { total: s.blocks * s.bsize, free: s.bavail * s.bsize };
  }
  catch
  {
    return { total: 0, free: 0 };
  }
}

// Persist a point-in-time host metrics snapshot, then enforce retention. Called
// on a natural cadence (scan completion) and available for a future scheduler.
export async function recordHealthSnapshot(): Promise<void>
{
  const disk = await diskUsage("/");
  getDb()
    .insert(healthSnapshots)
    .values({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadAvg1: os.loadavg()[0] ?? 0,
      diskTotal: disk.total,
      diskFree: disk.free,
      uptimeSeconds: Math.round(os.uptime()),
    })
    .run();
  pruneHistory();
}

export function listHealthSnapshots(limit = 200): HealthSnapshot[]
{
  // Oldest-first so charts read left-to-right in time order.
  return getDb()
    .select()
    .from(healthSnapshots)
    .orderBy(desc(healthSnapshots.createdAt))
    .limit(limit)
    .all()
    .reverse();
}

// Delete history older than the configured retention window. A window of 0 (the
// default) keeps everything. Returns the cutoff used, or null if disabled.
export function pruneHistory(): string | null
{
  const days = getNumberSetting(SETTING_KEYS.historyRetentionDays, 0);
  if (!days || days <= 0)
  {
    return null;
  }
  const cutoff = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString();
  const db = getDb();
  db.delete(healthSnapshots).where(lt(healthSnapshots.createdAt, cutoff)).run();
  db.delete(gitStatusSnapshots)
    .where(lt(gitStatusSnapshots.createdAt, cutoff))
    .run();
  db.delete(scanRuns).where(lt(scanRuns.startedAt, cutoff)).run();
  return cutoff;
}
