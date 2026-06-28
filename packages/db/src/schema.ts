import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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

// A single scan of a target. The metadata summary is stored as JSON.
export const scanRuns = sqliteTable("scan_runs", {
  id: text("id").primaryKey(),
  scanTargetId: text("scan_target_id")
    .notNull()
    .references(() => scanTargets.id),
  status: text("status").notNull(),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at"),
  summaryJson: text("summary_json"),
  errorMessage: text("error_message"),
});

export type ScanRun = typeof scanRuns.$inferSelect;
export type NewScanRun = typeof scanRuns.$inferInsert;

// Detected Git repositories. Remote URLs are stored sanitized (no credentials).
export const gitRepositories = sqliteTable("git_repositories", {
  id: text("id").primaryKey(),
  scanTargetId: text("scan_target_id"),
  path: text("path").notNull().unique(),
  sanitizedRemoteUrl: text("sanitized_remote_url"),
  remoteHost: text("remote_host"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type GitRepositoryRow = typeof gitRepositories.$inferSelect;
export type NewGitRepositoryRow = typeof gitRepositories.$inferInsert;

// Point-in-time status of a Git repository.
export const gitStatusSnapshots = sqliteTable("git_status_snapshots", {
  id: text("id").primaryKey(),
  gitRepositoryId: text("git_repository_id")
    .notNull()
    .references(() => gitRepositories.id),
  branch: text("branch"),
  isDirty: integer("is_dirty", { mode: "boolean" }).notNull().default(false),
  stagedCount: integer("staged_count").notNull().default(0),
  unstagedCount: integer("unstaged_count").notNull().default(0),
  untrackedCount: integer("untracked_count").notNull().default(0),
  aheadCount: integer("ahead_count").notNull().default(0),
  behindCount: integer("behind_count").notNull().default(0),
  lastCommitHash: text("last_commit_hash"),
  lastCommitSubject: text("last_commit_subject"),
  lastCommitDate: text("last_commit_date"),
  // Upstream last-commit date; only set when the scan fetched from the remote.
  remoteLastCommitDate: text("remote_last_commit_date"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export type GitStatusSnapshot = typeof gitStatusSnapshots.$inferSelect;
export type NewGitStatusSnapshot = typeof gitStatusSnapshots.$inferInsert;

// Point-in-time host metrics, persisted so trends can be charted over time.
// Non-privileged, non-secret data only.
export const healthSnapshots = sqliteTable("health_snapshots", {
  id: text("id").primaryKey(),
  createdAt: text("created_at").notNull(),
  totalMemory: integer("total_memory").notNull().default(0),
  freeMemory: integer("free_memory").notNull().default(0),
  loadAvg1: real("load_avg_1").notNull().default(0),
  diskTotal: integer("disk_total").notNull().default(0),
  diskFree: integer("disk_free").notNull().default(0),
  uptimeSeconds: integer("uptime_seconds").notNull().default(0),
});

export type HealthSnapshot = typeof healthSnapshots.$inferSelect;
export type NewHealthSnapshot = typeof healthSnapshots.$inferInsert;
