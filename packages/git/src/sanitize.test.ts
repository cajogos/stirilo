import { describe, expect, it } from "vitest";
import { sanitizeRemoteUrl } from "./sanitize.js";

describe("sanitizeRemoteUrl", () =>
{
  it("leaves a clean https URL unchanged", () =>
  {
    const result = sanitizeRemoteUrl("https://github.com/cajogos/stirilo.git");
    expect(result.url).toBe("https://github.com/cajogos/stirilo.git");
    expect(result.host).toBe("github.com");
  });

  it("preserves a clean scp-style remote", () =>
  {
    const result = sanitizeRemoteUrl("git@github.com:cajogos/stirilo.git");
    expect(result.url).toBe("git@github.com:cajogos/stirilo.git");
    expect(result.host).toBe("github.com");
  });

  it("strips a token from an https URL", () =>
  {
    const result = sanitizeRemoteUrl("https://ghp_secrettoken123@github.com/user/repo.git");
    expect(result.url).toBe("https://github.com/user/repo.git");
    expect(result.url).not.toContain("ghp_secrettoken123");
    expect(result.host).toBe("github.com");
  });

  it("strips username and password from an https URL", () =>
  {
    const result = sanitizeRemoteUrl("https://user:p4ssw0rd@github.com/user/repo.git");
    expect(result.url).toBe("https://github.com/user/repo.git");
    expect(result.url).not.toContain("p4ssw0rd");
  });

  it("strips credentials from an ssh:// URL", () =>
  {
    const result = sanitizeRemoteUrl("ssh://git:secret@example.com:22/repo.git");
    expect(result.url).not.toContain("secret");
    expect(result.host).toBe("example.com");
  });

  it("handles null and empty input", () =>
  {
    expect(sanitizeRemoteUrl(null).url).toBeNull();
    expect(sanitizeRemoteUrl("").url).toBeNull();
  });
});
