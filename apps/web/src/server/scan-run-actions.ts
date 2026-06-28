"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { redact } from "@stirilo/redaction";
import { recordAudit, scanRuns, scanTargets } from "@stirilo/db";
import { scanDirectory } from "@stirilo/scanner";
import { getDb } from "@/server/db";
import { getCurrentSession } from "@/server/session";

export async function runScan(formData: FormData): Promise<void>
{
  const targetId = String(formData.get("targetId") ?? "");
  const db = getDb();
  const target = db
    .select()
    .from(scanTargets)
    .where(eq(scanTargets.id, targetId))
    .all()[0];

  if (!target)
  {
    redirect("/scan-targets");
  }

  const session = await getCurrentSession();
  const actor = session?.username ?? "(unknown)";
  const id = randomUUID();
  const startedAt = new Date().toISOString();

  recordAudit(db, {
    actor,
    action: "scan_started",
    targetType: "scan_target",
    targetId,
  });

  try
  {
    const result = await scanDirectory(target.path);
    // Redact before storing, as a defence in depth (paths should be safe).
    const summaryJson = redact(JSON.stringify(result));
    db.insert(scanRuns)
      .values({
        id,
        scanTargetId: targetId,
        status: "completed",
        startedAt,
        finishedAt: new Date().toISOString(),
        summaryJson,
      })
      .run();
    db.update(scanTargets)
      .set({
        lastScanAt: new Date().toISOString(),
        lastScanStatus: "completed",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(scanTargets.id, targetId))
      .run();
    recordAudit(db, {
      actor,
      action: "scan_completed",
      targetType: "scan_target",
      targetId,
      metadata: {
        files: result.fileCount,
        sensitive: result.sensitiveMarkers.length,
      },
    });
  }
  catch (error)
  {
    db.insert(scanRuns)
      .values({
        id,
        scanTargetId: targetId,
        status: "failed",
        startedAt,
        finishedAt: new Date().toISOString(),
        errorMessage: redact(String(error)),
      })
      .run();
    db.update(scanTargets)
      .set({
        lastScanAt: new Date().toISOString(),
        lastScanStatus: "failed",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(scanTargets.id, targetId))
      .run();
    recordAudit(db, {
      actor,
      action: "scan_failed",
      targetType: "scan_target",
      targetId,
    });
  }

  revalidatePath(`/scan-targets/${targetId}`);
  revalidatePath("/dashboard");
  redirect(`/scan-targets/${targetId}`);
}
