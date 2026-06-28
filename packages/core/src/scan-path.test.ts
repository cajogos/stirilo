import { mkdtempSync, rmSync, symlinkSync, writeFileSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  categorizePath,
  expandTilde,
  validateScanTargetPath,
} from "./scan-path.js";

const created: string[] = [];

function tempDir(): string
{
  const dir = mkdtempSync(join(tmpdir(), "stirilo-test-"));
  created.push(dir);
  return dir;
}

afterAll(() =>
{
  for (const dir of created)
  {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("categorizePath", () =>
{
  it("blocks the filesystem root and system directories", () =>
  {
    expect(categorizePath("/")).toBe("blocked");
    expect(categorizePath("/proc/123")).toBe("blocked");
    expect(categorizePath("/sys")).toBe("blocked");
  });

  it("requires confirmation for sensitive and home directories", () =>
  {
    expect(categorizePath("/etc/nginx")).toBe("requires-confirmation");
    expect(categorizePath("/srv/www")).toBe("requires-confirmation");
    expect(categorizePath("/home/carlos/projects")).toBe(
      "requires-confirmation",
    );
  });

  it("matches by path segment, not string prefix", () =>
  {
    // "/home-backups" must not be treated as being under "/home".
    expect(categorizePath("/home-backups/data")).toBe("allowed");
    expect(categorizePath("/var/data/app")).toBe("allowed");
  });
});

describe("expandTilde", () =>
{
  it("expands a bare tilde and tilde-prefixed paths", () =>
  {
    expect(expandTilde("~")).not.toContain("~");
    expect(expandTilde("~/projects")).toMatch(/projects$/);
    expect(expandTilde("/absolute")).toBe("/absolute");
  });
});

describe("validateScanTargetPath", () =>
{
  it("rejects a path that does not exist", () =>
  {
    const result = validateScanTargetPath("/no/such/path/here");
    expect(result.ok).toBe(false);
    if (!result.ok)
    {
      expect(result.reason).toMatch(/does not exist/i);
    }
  });

  it("rejects a file that is not a directory", () =>
  {
    const dir = tempDir();
    const file = join(dir, "a.txt");
    writeFileSync(file, "x");
    const result = validateScanTargetPath(file, { confirm: true });
    expect(result.ok).toBe(false);
    if (!result.ok)
    {
      expect(result.reason).toMatch(/not a directory/i);
    }
  });

  it("requires confirmation for a directory under /tmp and accepts it once confirmed", () =>
  {
    const dir = tempDir();
    const unconfirmed = validateScanTargetPath(dir);
    expect(unconfirmed.ok).toBe(false);
    if (!unconfirmed.ok)
    {
      expect(unconfirmed.requiresConfirmation).toBe(true);
      expect(unconfirmed.category).toBe("blocked");
    }

    const confirmed = validateScanTargetPath(dir, { confirm: true });
    expect(confirmed.ok).toBe(true);
    if (confirmed.ok)
    {
      expect(confirmed.canonicalPath).toBe(realpathSync(dir));
    }
  });

  it("canonicalises symlinks before applying the blocklist", () =>
  {
    const dir = tempDir();
    const link = join(dir, "etc-link");
    // The link lives under /tmp (blocked) but points to /etc (confirm). The
    // result must reflect the resolved target, not the link's own location.
    symlinkSync("/etc", link);
    const result = validateScanTargetPath(link);
    expect(result.ok).toBe(false);
    if (!result.ok)
    {
      expect(result.category).toBe("requires-confirmation");
    }
  });
});
