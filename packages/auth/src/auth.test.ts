import { describe, it, expect } from "vitest";
import type { Config } from "@stirilo/core";
import { createInMemoryDatabase } from "@stirilo/db";
import { Argon2idHasher } from "./hasher.js";
import { verifyCredentials } from "./authenticate.js";
import { createSession, validateSession, deleteSession } from "./session.js";

const hasher = new Argon2idHasher();

function baseConfig(overrides: Partial<Config>): Config
{
  return {
    STIRILO_APP_URL: "http://localhost:3157",
    STIRILO_BIND_HOST: "127.0.0.1",
    STIRILO_PORT: 3157,
    STIRILO_DB_PATH: ":memory:",
    STIRILO_USERNAME: "admin",
    STIRILO_PASSWORD_HASH: "$argon2id$placeholder",
    STIRILO_SESSION_SECRET: "a-very-long-session-secret",
    STIRILO_AGENT_TOKEN: undefined,
    ...overrides,
  };
}

describe("Argon2idHasher", () =>
{
  it("verifies a correct password and rejects a wrong one", async () =>
  {
    const stored = await hasher.hash("correct horse");
    expect(await hasher.verify(stored, "correct horse")).toBe(true);
    expect(await hasher.verify(stored, "wrong")).toBe(false);
  });

  it("fails closed on a malformed hash", async () =>
  {
    expect(await hasher.verify("not-a-hash", "x")).toBe(false);
  });
});

describe("verifyCredentials", () =>
{
  it("accepts the configured user with the right password", async () =>
  {
    const config = baseConfig({
      STIRILO_PASSWORD_HASH: await hasher.hash("s3cret"),
    });
    expect(await verifyCredentials(config, "admin", "s3cret", hasher)).toBe(true);
  });

  it("rejects a wrong password", async () =>
  {
    const config = baseConfig({
      STIRILO_PASSWORD_HASH: await hasher.hash("s3cret"),
    });
    expect(await verifyCredentials(config, "admin", "nope", hasher)).toBe(false);
  });

  it("rejects a wrong username", async () =>
  {
    const config = baseConfig({
      STIRILO_PASSWORD_HASH: await hasher.hash("s3cret"),
    });
    expect(await verifyCredentials(config, "root", "s3cret", hasher)).toBe(false);
  });
});

describe("sessions", () =>
{
  it("creates, validates, and deletes a session", () =>
  {
    const { db } = createInMemoryDatabase();

    const token = createSession(db, "admin");
    expect(token).toHaveLength(64);

    const active = validateSession(db, token);
    expect(active?.username).toBe("admin");

    deleteSession(db, token);
    expect(validateSession(db, token)).toBeNull();
  });

  it("does not store the raw token", () =>
  {
    const { db, sqlite } = createInMemoryDatabase();
    const token = createSession(db, "admin");
    const row = sqlite
      .prepare("select session_hash from sessions")
      .get() as { session_hash: string };
    expect(row.session_hash).not.toBe(token);
  });
});
