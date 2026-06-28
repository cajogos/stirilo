import { describe, it, expect } from "vitest";
import { loadConfig } from "./config.js";

describe("loadConfig", () =>
{
  it("applies defaults when optional values are absent", () =>
  {
    const config = loadConfig({});
    expect(config.STIRILO_BIND_HOST).toBe("127.0.0.1");
    expect(config.STIRILO_PORT).toBe(3157);
    expect(config.STIRILO_DB_PATH).toBe("./data/stirilo.dev.db");
    expect(config.STIRILO_USERNAME).toBeUndefined();
  });

  it("coerces the port from a string", () =>
  {
    const config = loadConfig({ STIRILO_PORT: "4000" });
    expect(config.STIRILO_PORT).toBe(4000);
  });

  it("throws a readable error on an invalid port", () =>
  {
    expect(() => loadConfig({ STIRILO_PORT: "not-a-number" })).toThrow(
      /Invalid Stirilo configuration/,
    );
  });

  it("throws on a malformed app URL", () =>
  {
    expect(() => loadConfig({ STIRILO_APP_URL: "not a url" })).toThrow(
      /STIRILO_APP_URL/,
    );
  });

  it("rejects a too-short session secret", () =>
  {
    expect(() => loadConfig({ STIRILO_SESSION_SECRET: "short" })).toThrow(
      /STIRILO_SESSION_SECRET/,
    );
  });
});
