import { randomUUID } from "node:crypto";
import type { Db } from "./client.js";
import { auditLog } from "./schema.js";

export interface AuditInput
{
  actor: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

// Record an audit entry. Callers must never pass secrets in metadata; this is a
// plain writer and does not itself redact.
export function recordAudit(db: Db, input: AuditInput): void
{
  db.insert(auditLog)
    .values({
      id: randomUUID(),
      actor: input.actor,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      createdAt: new Date().toISOString(),
    })
    .run();
}
