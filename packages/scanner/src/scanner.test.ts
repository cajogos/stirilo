import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { scanDirectory } from "./scanner.js";

const SECRET_SENTINEL = "TOP_SECRET_VALUE_DO_NOT_INGEST_8675309";

const dirs: string[] = [];

function fixture(): string
{
  const root = mkdtempSync(join(tmpdir(), "stirilo-scan-"));
  dirs.push(root);

  writeFileSync(join(root, "package.json"), '{"name":"x"}');
  writeFileSync(join(root, "README.md"), "# hi");
  writeFileSync(join(root, "big.bin"), "x".repeat(5000));
  // A sensitive file whose CONTENTS must never be ingested.
  writeFileSync(join(root, ".env"), `SECRET=${SECRET_SENTINEL}\n`);

  mkdirSync(join(root, "node_modules"));
  writeFileSync(join(root, "node_modules", "junk.js"), "junk");
  mkdirSync(join(root, ".git"));
  writeFileSync(join(root, ".git", "config"), "[core]");
  mkdirSync(join(root, "src"));
  writeFileSync(join(root, "src", "index.ts"), "export {};");

  return root;
}

afterAll(() =>
{
  for (const dir of dirs)
  {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("scanDirectory", () =>
{
  it("scans a directory and reports metadata", async () =>
  {
    const result = await scanDirectory(fixture());
    expect(result.fileCount).toBeGreaterThan(0);
    expect(result.directoryCount).toBe(1); // only src; node_modules/.git pruned
    expect(result.projectMarkers).toContain("node-package");
    expect(result.projectMarkers).toContain("readme");
    expect(result.largestFiles[0]?.path).toBe("big.bin");
  });

  it("prunes ignored directories", async () =>
  {
    const result = await scanDirectory(fixture());
    expect(result.ignoredDirectories).toContain("node_modules");
    expect(result.ignoredDirectories).toContain(".git");
    // The pruned files must not appear anywhere in the result.
    expect(JSON.stringify(result)).not.toContain("junk.js");
  });

  it("detects the .env file as sensitive WITHOUT reading its contents", async () =>
  {
    const result = await scanDirectory(fixture());

    const env = result.sensitiveMarkers.find((m) => m.path === ".env");
    expect(env).toBeDefined();
    expect(env?.rule).toBe("env-file");

    // The headline guarantee: the secret value never enters the result.
    expect(JSON.stringify(result)).not.toContain(SECRET_SENTINEL);
  });

  it("measures reclaimable space for ignored artifact directories", async () =>
  {
    const result = await scanDirectory(fixture());
    const nm = result.artifactDirectories.find((d) => d.name === "node_modules");
    expect(nm).toBeDefined();
    expect(nm?.size).toBeGreaterThan(0);
    expect(result.reclaimableBytes).toBeGreaterThanOrEqual(nm?.size ?? 0);
    // The pruned file names must still never appear.
    expect(JSON.stringify(result)).not.toContain("junk.js");
  });

  it("ranks largest directories and reports stale files", async () =>
  {
    const result = await scanDirectory(fixture());
    expect(result.largestDirectories.some((d) => d.path === "src")).toBe(true);
    expect(result.staleFiles.length).toBeGreaterThan(0);
  });
});

describe("scanDirectory duplicate detection", () =>
{
  function dupFixture(): string
  {
    const root = mkdtempSync(join(tmpdir(), "stirilo-dup-"));
    dirs.push(root);
    mkdirSync(join(root, "a"));
    mkdirSync(join(root, "b"));
    // Same name + same size in two places -> a duplicate candidate.
    writeFileSync(join(root, "a", "logo.png"), "PNGDATA-1234");
    writeFileSync(join(root, "b", "logo.png"), "PNGDATA-5678");
    // A unique file (no match) must not be grouped.
    writeFileSync(join(root, "unique.txt"), "only-one");
    // A sensitive duplicate must NOT be grouped (excluded by design).
    writeFileSync(join(root, "a", ".env"), "AAAA");
    writeFileSync(join(root, "b", ".env"), "BBBB");
    return root;
  }

  it("groups non-sensitive files by size and name, excluding sensitive files", async () =>
  {
    const result = await scanDirectory(dupFixture());

    const logo = result.potentialDuplicates.find((g) => g.name === "logo.png");
    expect(logo).toBeDefined();
    expect(logo?.count).toBe(2);
    expect(logo?.wastedBytes).toBe(logo?.size);

    // .env files are sensitive and must never appear as a duplicate group.
    expect(result.potentialDuplicates.some((g) => g.name === ".env")).toBe(
      false,
    );
    // Unique files are not grouped.
    expect(
      result.potentialDuplicates.some((g) => g.name === "unique.txt"),
    ).toBe(false);
  });

  it("can be disabled via options", async () =>
  {
    const result = await scanDirectory(dupFixture(), {
      detectDuplicates: false,
    });
    expect(result.potentialDuplicates).toEqual([]);
  });
});
