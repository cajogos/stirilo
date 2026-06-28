"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/server/session";
import { executeScan } from "@/server/services/scan-service";

export async function runScan(formData: FormData): Promise<void>
{
  const targetId = String(formData.get("targetId") ?? "");
  const session = await getCurrentSession();

  const result = await executeScan(session?.username ?? "(unknown)", targetId);
  if (!result.ok)
  {
    redirect("/scan-targets");
  }

  revalidatePath(`/scan-targets/${targetId}`);
  revalidatePath("/dashboard");
  redirect(`/scan-targets/${targetId}`);
}
