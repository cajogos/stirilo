"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { redact } from "@stirilo/redaction";
import {
  gitRepositories,
  gitStatusSnapshots,
  recordAudit,
  scanRuns,
  scanTargets,
} from "@stirilo/db";
import { scanDirectory } from "@stirilo/scanner";
import { findRepositories } from "@stirilo/git";
import { getDb } from "@/server/db";
import { getCurrentSession } from "@/server/session";

// Detect Git repositories under the target and persist a status snapshot each.
// Best-effort: a git failure must not fail the filesystem scan.
async function detectGitRepositories(
  db: ReturnType<typeof getDb>,
  targetId: string,
  rootPath: string,
): Promise<void>
{
  const repos = await findRepositories(rootPath);
  for (const repo of repos)
  {
    const now = new Date().toISOString();
    const existing = db
      .select()
      .from(gitRepositories)
      .where(eq(gitRepositories.path, repo.path))
      .all()[0];

    let repoId: string;
    if (existing)
    {
      repoId = existing.id;
      db.update(gitRepositories)
        .set({
          scanTargetId: targetId,
          sanitizedRemoteUrl: repo.status.sanitizedRemoteUrl,
          remoteHost: repo.status.remoteHost,
          updatedAt: now,
        })
        .where(eq(gitRepositories.id, repoId))
        .run();
    }
    else
    {
      repoId = randomUUID();
      db.insert(gitRepositories)
        .values({
          id: repoId,
          scanTargetId: targetId,
          path: repo.path,
          sanitizedRemoteUrl: repo.status.sanitizedRemoteUrl,
          remoteHost: repo.status.remoteHost,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }

    db.insert(gitStatusSnapshots)
      .values({
        id: randomUUID(),
        gitRepositoryId: repoId,
        branch: repo.status.branch,
        isDirty: repo.status.isDirty,
        stagedCount: repo.status.stagedCount,
        unstagedCount: repo.status.unstagedCount,
        untrackedCount: repo.status.untrackedCount,
        aheadCount: repo.status.aheadCount,
        behindCount: repo.status.behindCount,
        lastCommitHash: repo.status.lastCommitHash,
        lastCommitSubject: repo.status.lastCommitSubject,
        lastCommitDate: repo.status.lastCommitDate,
        createdAt: now,
      })
      .run();
  }
}

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

    try
    {
      await detectGitRepositories(db, targetId, target.path);
    }
    catch
    {
      // Git detection is best-effort; the filesystem scan already succeeded.
    }

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
