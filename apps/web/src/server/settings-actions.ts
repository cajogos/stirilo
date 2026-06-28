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
