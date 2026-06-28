import "server-only";
import { randomUUID } from "node:crypto";
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
import { getBooleanSetting, SETTING_KEYS } from "@/server/settings";
import { recordHealthSnapshot } from "@/server/health-history";
import { evaluateAndDispatchAlerts } from "@/server/alerts";

export type ExecuteScanResult =
  | { ok: true; runId: string; status: "completed" | "failed" }
  | { ok: false; code: "NOT_FOUND"; message: string };

export type ScanEvent =
  | { type: "progress"; files: number }
  | { type: "repo"; path: string }
  | { type: "done"; files: number; directories: number; sensitive: number; repos: number }
  | { type: "error"; message: string };

export type ScanEventHandler = (event: ScanEvent) => void;

async function detectGitRepositories(
  db: ReturnType<typeof getDb>,
  targetId: string,
  rootPath: string,
  onEvent?: ScanEventHandler,
): Promise<number>
{
  let count = 0;
  // Off by default. When enabled in settings, scans fetch from remotes so
  // ahead/behind and the upstream commit date are accurate (a behavior change).
  const fetch = getBooleanSetting(SETTING_KEYS.gitFetchOnScan, false);
  const repos = await findRepositories(
    rootPath,
    (repo) =>
    {
      count += 1;
      onEvent?.({ type: "repo", path: repo.path });
    },
    { fetch },
  );
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
        remoteLastCommitDate: repo.status.remoteLastCommitDate,
        sizeBytes: repo.sizeBytes,
        createdAt: now,
      })
      .run();
  }

  return count;
}

// Shared scan execution used by the UI action and the HTTP API. Performs the
// filesystem scan, best-effort git detection, persistence, and auditing.
// When onEvent is provided, progress/repo/done events are emitted for streaming.
export async function executeScan(
  actor: string,
  targetId: string,
  onEvent?: ScanEventHandler,
): Promise<ExecuteScanResult>
{
  const db = getDb();
  const target = db
    .select()
    .from(scanTargets)
    .where(eq(scanTargets.id, targetId))
    .all()[0];

  if (!target)
  {
    onEvent?.({ type: "error", message: "Scan target not found." });
    return { ok: false, code: "NOT_FOUND", message: "Scan target not found." };
  }

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
    const result = await scanDirectory(target.path, {
      onProgress: (files) => onEvent?.({ type: "progress", files }),
    });
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

    let repoCount = 0;
    try
    {
      repoCount = await detectGitRepositories(db, targetId, target.path, onEvent);
    }
    catch
    {
      // Git detection is best-effort; the filesystem scan already succeeded.
    }

    // Capture a host metrics snapshot on this natural cadence (best-effort) so
    // health trends accumulate without a separate scheduler. Also prunes
    // history per the configured retention window.
    try
    {
      await recordHealthSnapshot();
    }
    catch
    {
      // History recording is best-effort; the scan already succeeded.
    }

    // Evaluate and dispatch alert rules (best-effort). Runs after the git
    // snapshot + health snapshot above so disk/sensitive/dirty conditions are
    // current. Payloads are redacted inside the alert layer.
    try
    {
      await evaluateAndDispatchAlerts(targetId);
    }
    catch
    {
      // Alerting is best-effort; never fail a scan because of it.
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
    onEvent?.({
      type: "done",
      files: result.fileCount,
      directories: result.directoryCount,
      sensitive: result.sensitiveMarkers.length,
      repos: repoCount,
    });
    return { ok: true, runId: id, status: "completed" };
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
    onEvent?.({ type: "error", message: "Scan failed." });
    return { ok: true, runId: id, status: "failed" };
  }
}
