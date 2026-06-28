"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/server/session";
import { setSetting, SETTING_KEYS } from "@/server/settings";

// Persist the "fetch from remotes during scan" toggle. A checkbox submits "on"
// only when checked, so an absent value means disabled.
export async function updateGitFetchOnScan(formData: FormData): Promise<void>
{
  const session = await getCurrentSession();
  const enabled = formData.get("gitFetchOnScan") === "on";
  setSetting(
    SETTING_KEYS.gitFetchOnScan,
    enabled ? "true" : "false",
    session?.username ?? "(unknown)",
  );
  revalidatePath("/settings");
}

// Persist the history retention window in days. 0 (or invalid) means keep all.
export async function updateHistoryRetention(formData: FormData): Promise<void>
{
  const session = await getCurrentSession();
  const raw = Number(formData.get("historyRetentionDays"));
  const days = Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  setSetting(
    SETTING_KEYS.historyRetentionDays,
    String(days),
    session?.username ?? "(unknown)",
  );
  revalidatePath("/settings");
}

// Persist alerting configuration: webhook URL, disk threshold (0 disables), and
// the new-sensitive / dirty-repo toggles. The webhook URL is non-secret config.
export async function updateAlertSettings(formData: FormData): Promise<void>
{
  const session = await getCurrentSession();
  const actor = session?.username ?? "(unknown)";

  const webhookUrl = String(formData.get("alertWebhookUrl") ?? "").trim();
  setSetting(SETTING_KEYS.alertWebhookUrl, webhookUrl, actor);

  const rawDisk = Number(formData.get("alertDiskThresholdPercent"));
  const disk =
    Number.isFinite(rawDisk) && rawDisk > 0 && rawDisk <= 100
      ? Math.floor(rawDisk)
      : 0;
  setSetting(SETTING_KEYS.alertDiskThresholdPercent, String(disk), actor);

  setSetting(
    SETTING_KEYS.alertOnSensitive,
    formData.get("alertOnSensitive") === "on" ? "true" : "false",
    actor,
  );
  setSetting(
    SETTING_KEYS.alertOnDirty,
    formData.get("alertOnDirty") === "on" ? "true" : "false",
    actor,
  );

  revalidatePath("/settings");
}
