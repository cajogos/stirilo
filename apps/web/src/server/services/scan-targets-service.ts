import "server-only";
import { randomUUID } from "node:crypto";
import { validateScanTargetPath } from "@stirilo/core";
import { recordAudit, scanTargets } from "@stirilo/db";
import { getDb } from "@/server/db";

export type CreateScanTargetResult =
  | { ok: true; id: string; path: string }
  | {
      ok: false;
      code: "VALIDATION_ERROR" | "CONFIRMATION_REQUIRED" | "DUPLICATE";
      message: string;
    };

export interface CreateScanTargetInput
{
  name: string;
  path: string;
  confirm: boolean;
  actor: string;
}

// Shared scan-target creation used by both the UI server action and the HTTP
// API, so validation, persistence, and auditing live in one place.
export function createScanTargetRecord(
  input: CreateScanTargetInput,
): CreateScanTargetResult
{
  const name = input.name.trim();
  const path = input.path.trim();
  if (!name || !path)
  {
    return {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "Name and path are both required.",
    };
  }

  const validation = validateScanTargetPath(path, { confirm: input.confirm });
  if (!validation.ok)
  {
    return {
      ok: false,
      code: validation.requiresConfirmation
        ? "CONFIRMATION_REQUIRED"
        : "VALIDATION_ERROR",
      message: validation.reason,
    };
  }

  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  try
  {
    db.insert(scanTargets)
      .values({
        id,
        name,
        path: validation.canonicalPath,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
  catch
  {
    return {
      ok: false,
      code: "DUPLICATE",
      message: "A scan target with that path already exists.",
    };
  }

  recordAudit(db, {
    actor: input.actor,
    action: "scan_target_created",
    targetType: "scan_target",
    targetId: id,
    metadata: { path: validation.canonicalPath },
  });

  return { ok: true, id, path: validation.canonicalPath };
}
