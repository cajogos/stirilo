import "server-only";
import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { isScheduleDue } from "@stirilo/core";
import { recordAudit, schedules, type Schedule } from "@stirilo/db";
import { getDb } from "@/server/db";
import { listScanTargets } from "@/server/scan-targets";
import { executeScan } from "@/server/services/scan-service";

export function listSchedules(): Schedule[]
{
  return getDb()
    .select()
    .from(schedules)
    .orderBy(desc(schedules.createdAt))
    .all();
}

export function createSchedule(
  scanTargetId: string | null,
  intervalMinutes: number,
  actor: string,
): void
{
  const db = getDb();
  const id = randomUUID();
  db.insert(schedules)
    .values({
      id,
      scanTargetId,
      intervalMinutes,
      enabled: true,
      createdAt: new Date().toISOString(),
    })
    .run();
  recordAudit(db, {
    actor,
    action: "schedule_created",
    targetType: "schedule",
    targetId: id,
    metadata: { scanTargetId, intervalMinutes },
  });
}

export function setScheduleEnabled(
  id: string,
  enabled: boolean,
  actor: string,
): void
{
  const db = getDb();
  db.update(schedules).set({ enabled }).where(eq(schedules.id, id)).run();
  recordAudit(db, {
    actor,
    action: enabled ? "schedule_enabled" : "schedule_disabled",
    targetType: "schedule",
    targetId: id,
  });
}

export function deleteSchedule(id: string, actor: string): void
{
  const db = getDb();
  db.delete(schedules).where(eq(schedules.id, id)).run();
  recordAudit(db, {
    actor,
    action: "schedule_deleted",
    targetType: "schedule",
    targetId: id,
  });
}

// Run every schedule that is due. A null scanTargetId fans out to all enabled
// targets. Returns the number of scans started. Best-effort per target so one
// failure does not stop the rest.
export async function runDueSchedules(actor = "scheduler"): Promise<number>
{
  const now = Date.now();
  let started = 0;

  for (const schedule of listSchedules())
  {
    if (!schedule.enabled)
    {
      continue;
    }
    if (!isScheduleDue(schedule.lastRunAt, schedule.intervalMinutes, now))
    {
      continue;
    }

    const targetIds = schedule.scanTargetId
      ? [schedule.scanTargetId]
      : listScanTargets()
          .filter((t) => t.enabled)
          .map((t) => t.id);

    for (const targetId of targetIds)
    {
      try
      {
        await executeScan(actor, targetId);
        started += 1;
      }
      catch
      {
        // Best-effort: continue with the remaining targets.
      }
    }

    getDb()
      .update(schedules)
      .set({ lastRunAt: new Date().toISOString() })
      .where(eq(schedules.id, schedule.id))
      .run();
  }

  return started;
}
