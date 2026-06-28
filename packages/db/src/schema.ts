import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Key/value application settings. The database is dedicated to Stirilo, so no
// table prefix is used.
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;

// Authenticated sessions. Only the hash of the session token is stored, never
// the raw token.
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  sessionHash: text("session_hash").notNull(),
  username: text("username").notNull(),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  lastSeenAt: text("last_seen_at"),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// Audit log of important actions. Never store secrets here.
export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadataJson: text("metadata_json"),
  createdAt: text("created_at").notNull(),
});

export type AuditEntry = typeof auditLog.$inferSelect;
export type NewAuditEntry = typeof auditLog.$inferInsert;

// Local directories registered as scan targets.
export const scanTargets = sqliteTable("scan_targets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull().unique(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  lastScanAt: text("last_scan_at"),
  lastScanStatus: text("last_scan_status"),
});

export type ScanTarget = typeof scanTargets.$inferSelect;
export type NewScanTarget = typeof scanTargets.$inferInsert;
