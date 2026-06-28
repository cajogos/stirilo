import "server-only";
import { desc, eq } from "drizzle-orm";
import { scanTargets, type ScanTarget } from "@stirilo/db";
import { getDb } from "@/server/db";

// List all scan targets, newest first. Usable by server components now and the
// HTTP API later.
export function listScanTargets(): ScanTarget[]
{
  return getDb()
    .select()
    .from(scanTargets)
    .orderBy(desc(scanTargets.createdAt))
    .all();
}

export function getScanTargetById(id: string): ScanTarget | null
{
  const rows = getDb()
    .select()
    .from(scanTargets)
    .where(eq(scanTargets.id, id))
    .all();
  return rows[0] ?? null;
}
