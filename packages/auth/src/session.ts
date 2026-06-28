import { createHash, randomBytes, randomUUID } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { type Db, sessions } from "@stirilo/db";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface ActiveSession
{
  username: string;
}

function hashToken(token: string): string
{
  return createHash("sha256").update(token).digest("hex");
}

// Create a session and return the raw token (for the cookie). Only the token's
// hash is persisted.
export function createSession(db: Db, username: string): string
{
  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  db.insert(sessions)
    .values({
      id: randomUUID(),
      sessionHash: hashToken(token),
      username,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastSeenAt: now.toISOString(),
    })
    .run();

  return token;
}

// Validate a raw token against stored session hashes. Returns the session if it
// exists and has not expired.
export function validateSession(db: Db, token: string): ActiveSession | null
{
  const nowIso = new Date().toISOString();
  const rows = db
    .select()
    .from(sessions)
    .where(
      and(eq(sessions.sessionHash, hashToken(token)), gt(sessions.expiresAt, nowIso)),
    )
    .all();

  const row = rows[0];
  if (!row)
  {
    return null;
  }

  db.update(sessions)
    .set({ lastSeenAt: nowIso })
    .where(eq(sessions.id, row.id))
    .run();

  return { username: row.username };
}

export function deleteSession(db: Db, token: string): void
{
  db.delete(sessions).where(eq(sessions.sessionHash, hashToken(token))).run();
}
