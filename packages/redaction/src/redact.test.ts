import { describe, it, expect } from "vitest";
import { redact, REDACTED } from "./redact.js";

describe("redact", () =>
{
  it("redacts a GitHub personal access token", () =>
  {
    const secret = "ghp_" + "a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8";
    const out = redact(`token is ${secret} ok`);
    expect(out).not.toContain(secret);
    expect(out).toContain(REDACTED);
  });

  it("redacts an AWS access key id", () =>
  {
    const secret = "AKIAIOSFODNN7EXAMPLE";
    const out = redact(`aws ${secret}`);
    expect(out).not.toContain(secret);
    expect(out).toContain(REDACTED);
  });

  it("redacts a JWT", () =>
  {
    const jwt =
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dQw4w9WgXcQabcdEFGHIJ";
    const out = redact(`Authorization header ${jwt}`);
    expect(out).not.toContain(jwt);
    expect(out).toContain(REDACTED);
  });

  it("redacts the password in a database URL", () =>
  {
    const url = "postgres://admin:s3cr3tP@ss@db.internal:5432/app";
    const out = redact(url);
    expect(out).not.toContain("s3cr3tP@ss");
    expect(out).toContain("postgres://admin:[REDACTED]@");
  });

  it("redacts a Bearer token but keeps the scheme", () =>
  {
    const out = redact("Authorization: Bearer abc.def.ghi123");
    expect(out).toContain("Bearer [REDACTED]");
    expect(out).not.toContain("abc.def.ghi123");
  });

  it("redacts key/value secrets", () =>
  {
    const out = redact('password=hunter2 and api_key: "live_xyz123"');
    expect(out).not.toContain("hunter2");
    expect(out).not.toContain("live_xyz123");
    expect(out).toContain(REDACTED);
  });

  it("is deterministic and leaves ordinary text alone", () =>
  {
    const text = "the quick brown fox";
    expect(redact(text)).toBe(text);
    expect(redact("password=abc")).toBe(redact("password=abc"));
  });
});
