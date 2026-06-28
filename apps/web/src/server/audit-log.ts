import "server-only";
import { desc } from "drizzle-orm";
import { auditLog, type AuditEntry } from "@stirilo/db";
import { getDb } from "@/server/db";

export function listAuditEntries(limit = 100): AuditEntry[]
{
  return getDb()
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .all();
}
