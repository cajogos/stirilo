"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/server/session";
import {
  createSchedule,
  deleteSchedule,
  setScheduleEnabled,
} from "@/server/schedules";

export async function createScheduleAction(formData: FormData): Promise<void>
{
  const session = await getCurrentSession();
  const rawTarget = String(formData.get("scanTargetId") ?? "");
  const scanTargetId = rawTarget === "" ? null : rawTarget;
  const interval = Number(formData.get("intervalMinutes"));
  const intervalMinutes =
    Number.isFinite(interval) && interval > 0 ? Math.floor(interval) : 60;

  createSchedule(scanTargetId, intervalMinutes, session?.username ?? "(unknown)");
  revalidatePath("/schedules");
}

export async function toggleScheduleAction(formData: FormData): Promise<void>
{
  const session = await getCurrentSession();
  const id = String(formData.get("id") ?? "");
  const enabled = String(formData.get("enabled") ?? "") === "true";
  setScheduleEnabled(id, enabled, session?.username ?? "(unknown)");
  revalidatePath("/schedules");
}

export async function deleteScheduleAction(formData: FormData): Promise<void>
{
  const session = await getCurrentSession();
  const id = String(formData.get("id") ?? "");
  deleteSchedule(id, session?.username ?? "(unknown)");
  revalidatePath("/schedules");
}
