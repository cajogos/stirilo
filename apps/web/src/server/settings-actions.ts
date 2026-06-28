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
