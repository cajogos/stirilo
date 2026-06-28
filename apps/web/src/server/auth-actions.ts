"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth-constants";

// Phase 1 stub: accept the form and set a placeholder session cookie. Phase 2b
// replaces this with credential verification and a real DB-backed session.
export async function login(): Promise<void>
{
  const store = await cookies();
  store.set(SESSION_COOKIE, "stub-session", {
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
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
