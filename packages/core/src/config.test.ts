import { describe, it, expect } from "vitest";
import { loadConfig, type EnvSource } from "./config.js";

// The minimal set of required (no-default) fields.
const required: EnvSource = {
  STIRILO_USERNAME: "admin",
  STIRILO_PASSWORD_HASH: "$argon2id$dummy",
  STIRILO_SESSION_SECRET: "a-very-long-session-secret",
};

describe("loadConfig", () =>
{
  it("applies defaults for the non-secret fields", () =>
  {
    const config = loadConfig({ ...required });
    expect(config.STIRILO_BIND_HOST).toBe("127.0.0.1");
    expect(config.STIRILO_PORT).toBe(3157);
    expect(config.STIRILO_DB_PATH).toBe("./data/stirilo.dev.db");
    expect(config.STIRILO_AGENT_TOKEN).toBeUndefined();
  });

  it("coerces the port from a string", () =>
  {
    const config = loadConfig({ ...required, STIRILO_PORT: "4000" });
    expect(config.STIRILO_PORT).toBe(4000);
  });

  it("throws a readable error on an invalid port", () =>
  {
    expect(() =>
      loadConfig({ ...required, STIRILO_PORT: "not-a-number" }),
    ).toThrow(/Invalid Stirilo configuration/);
  });

  it("throws on a malformed app URL", () =>
  {
    expect(() =>
      loadConfig({ ...required, STIRILO_APP_URL: "not a url" }),
    ).toThrow(/STIRILO_APP_URL/);
  });

  it("rejects a too-short session secret", () =>
  {
    expect(() =>
      loadConfig({ ...required, STIRILO_SESSION_SECRET: "short" }),
    ).toThrow(/STIRILO_SESSION_SECRET/);
  });

  it("fails fast when required auth config is missing", () =>
  {
    expect(() => loadConfig({})).toThrow(/STIRILO_USERNAME/);
  });

  it("treats an empty optional agent token as unset", () =>
  {
    const config = loadConfig({ ...required, STIRILO_AGENT_TOKEN: "" });
    expect(config.STIRILO_AGENT_TOKEN).toBeUndefined();
  });
});
