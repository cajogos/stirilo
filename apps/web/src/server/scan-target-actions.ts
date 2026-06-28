"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { validateScanTargetPath } from "@stirilo/core";
import { recordAudit, scanTargets } from "@stirilo/db";
import { getDb } from "@/server/db";
import { getCurrentSession } from "@/server/session";

function backWithError(message: string, needsConfirm = false): never
{
  const params = new URLSearchParams({ error: message });
  if (needsConfirm)
  {
    params.set("confirm", "1");
  }
  redirect(`/scan-targets?${params.toString()}`);
}

export async function createScanTarget(formData: FormData): Promise<void>
{
  const name = String(formData.get("name") ?? "").trim();
  const pathInput = String(formData.get("path") ?? "").trim();
  const confirm = formData.get("confirm") === "on";

  if (!name || !pathInput)
  {
    backWithError("Name and path are both required.");
  }

  const result = validateScanTargetPath(pathInput, { confirm });
  if (!result.ok)
  {
    backWithError(result.reason, result.requiresConfirmation === true);
  }

  const session = await getCurrentSession();
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  try
  {
    db.insert(scanTargets)
      .values({
        id,
        name,
        path: result.canonicalPath,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
  catch
  {
    backWithError("A scan target with that path already exists.");
  }

  recordAudit(db, {
    actor: session?.username ?? "(unknown)",
    action: "scan_target_created",
    targetType: "scan_target",
    targetId: id,
    metadata: { path: result.canonicalPath },
  });

  revalidatePath("/scan-targets");
  redirect("/scan-targets");
}
