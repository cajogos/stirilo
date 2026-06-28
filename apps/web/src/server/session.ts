import "server-only";
import { cookies } from "next/headers";
import { validateSession } from "@stirilo/auth";
import { SESSION_COOKIE } from "@/lib/auth-constants";
import { getDb } from "@/server/db";

export interface Session
{
  username: string;
}

// Authoritative server-side session check: the cookie token is validated against
// the database (existence + expiry), not merely its presence.
export async function getCurrentSession(): Promise<Session | null>
{
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token)
  {
    return null;
  }

  const active = validateSession(getDb(), token);
  return active ? { username: active.username } : null;
}
