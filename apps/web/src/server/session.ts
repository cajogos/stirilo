import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth-constants";

export interface Session
{
  username: string;
}

// Phase 1 seam: a session simply means the cookie is present. Phase 2b replaces
// the body of this function with real server-side session validation against the
// database, without changing the call sites.
export async function getCurrentSession(): Promise<Session | null>
{
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token)
  {
    return null;
  }

  return { username: "admin" };
}
