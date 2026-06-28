"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loadConfig } from "@stirilo/core";
import {
  createSession,
  deleteSession,
  validateSession,
  verifyCredentials,
} from "@stirilo/auth";
import { recordAudit } from "@stirilo/db";
import { SESSION_COOKIE } from "@/lib/auth-constants";
import { getDb } from "@/server/db";

export async function login(formData: FormData): Promise<void>
{
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const config = loadConfig();
  const db = getDb();

  const ok = await verifyCredentials(config, username, password);
  if (!ok)
  {
    recordAudit(db, { actor: username || "(unknown)", action: "login_failure" });
    redirect("/login?error=invalid");
  }

  const token = createSession(db, username);
  recordAudit(db, { actor: username, action: "login_success" });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/dashboard");
}

export async function logout(): Promise<void>
{
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token)
  {
    const db = getDb();
    const active = validateSession(db, token);
    deleteSession(db, token);
    recordAudit(db, {
      actor: active?.username ?? "(unknown)",
      action: "logout",
    });
  }

  store.delete(SESSION_COOKIE);
  redirect("/login");
}
