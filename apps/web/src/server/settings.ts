import "server-only";
import { eq } from "drizzle-orm";
import { recordAudit, settings } from "@stirilo/db";
import { getDb } from "@/server/db";

// Typed access to the key/value settings table. Values are stored as text; the
// helpers here own the (de)serialization so call sites stay simple. Settings are
// non-secret configuration only - never store tokens or credentials here.

export const SETTING_KEYS = {
  gitFetchOnScan: "git.fetch_on_scan",
  historyRetentionDays: "history.retention_days",
  alertWebhookUrl: "alert.webhook_url",
  alertDiskThresholdPercent: "alert.disk_threshold_percent",
  alertOnSensitive: "alert.on_new_sensitive",
  alertOnDirty: "alert.on_dirty_repos",
} as const;

export function getSetting(key: string): string | null
{
  const rows = getDb()
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .all();
  return rows[0]?.value ?? null;
}

export function getBooleanSetting(key: string, fallback = false): boolean
{
  const value = getSetting(key);
  if (value === null)
  {
    return fallback;
  }
  return value === "true";
}

export function getNumberSetting(key: string, fallback: number): number
{
  const value = getSetting(key);
  if (value === null)
  {
    return fallback;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Upsert a setting and write an audit entry. The value is non-secret config.
export function setSetting(key: string, value: string, actor: string): void
{
  const db = getDb();
  const now = new Date().toISOString();
  db.insert(settings)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: now } })
    .run();
  recordAudit(db, {
    actor,
    action: "setting_updated",
    targetType: "setting",
    targetId: key,
    metadata: { value },
  });
}
