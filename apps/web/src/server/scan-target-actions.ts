"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/server/session";
import { createScanTargetRecord } from "@/server/services/scan-targets-service";

export async function createScanTarget(formData: FormData): Promise<void>
{
  const name = String(formData.get("name") ?? "");
  const path = String(formData.get("path") ?? "");
  const confirm = formData.get("confirm") === "on";
  const session = await getCurrentSession();

  const result = createScanTargetRecord({
    name,
    path,
    confirm,
    actor: session?.username ?? "(unknown)",
  });

  if (!result.ok)
  {
    const params = new URLSearchParams({ error: result.message });
    if (result.code === "CONFIRMATION_REQUIRED")
    {
      params.set("confirm", "1");
    }
    redirect(`/scan-targets?${params.toString()}`);
  }

  revalidatePath("/scan-targets");
  redirect("/scan-targets");
}
