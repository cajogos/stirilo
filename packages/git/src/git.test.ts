import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { findRepositories, getGitStatus } from "./git.js";

const dirs: string[] = [];

function tempDir(): string
{
  const dir = mkdtempSync(join(tmpdir(), "stirilo-git-"));
  dirs.push(dir);
  return dir;
}

function gitInit(dir: string): void
{
  const opts = { cwd: dir, stdio: "ignore" as const };
  execFileSync("git", ["init", "-q"], opts);
  execFileSync("git", ["config", "user.email", "t@example.com"], opts);
  execFileSync("git", ["config", "user.name", "Tester"], opts);
  execFileSync("git", ["config", "commit.gpgsign", "false"], opts);
}

function gitCommit(dir: string, message: string): void
{
  const opts = { cwd: dir, stdio: "ignore" as const };
  execFileSync("git", ["add", "."], opts);
  execFileSync("git", ["commit", "-m", message, "-q"], opts);
}

afterAll(() =>
{
  for (const dir of dirs)
  {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("getGitStatus", () =>
{
  it("reports a clean repo with its last commit", async () =>
  {
    const dir = tempDir();
    gitInit(dir);
    writeFileSync(join(dir, "a.txt"), "hello");
    gitCommit(dir, "initial commit");

    const status = await getGitStatus(dir);
    expect(status.branch).toBeTruthy();
    expect(status.isDirty).toBe(false);
    expect(status.lastCommitSubject).toBe("initial commit");
    expect(status.lastCommitHash).toMatch(/^[0-9a-f]{40}$/);
  });

  it("detects untracked and modified files as dirty", async () =>
  {
    const dir = tempDir();
    gitInit(dir);
    writeFileSync(join(dir, "a.txt"), "hello");
    gitCommit(dir, "initial");

    writeFileSync(join(dir, "a.txt"), "changed");
    writeFileSync(join(dir, "new.txt"), "new");

    const status = await getGitStatus(dir);
    expect(status.isDirty).toBe(true);
    expect(status.untrackedCount).toBeGreaterThanOrEqual(1);
    expect(status.unstagedCount).toBeGreaterThanOrEqual(1);
  });
});

describe("findRepositories", () =>
{
  it("finds a repository under a root directory", async () =>
  {
    const root = tempDir();
    const repo = join(root, "project");
    mkdirSync(repo);
    gitInit(repo);
    writeFileSync(join(repo, "a.txt"), "x");
    gitCommit(repo, "init");

    const repos = await findRepositories(root);
    expect(repos).toHaveLength(1);
    expect(repos[0]?.path).toBe(repo);
  });
});
