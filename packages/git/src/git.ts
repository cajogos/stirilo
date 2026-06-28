import { execFile } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { sanitizeRemoteUrl } from "./sanitize.js";

const run = promisify(execFile);

// Directories never descended into when searching for repositories.
const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
  ".cache",
  "vendor",
  "target",
  "__pycache__",
]);

export interface GitStatus
{
  branch: string | null;
  isDirty: boolean;
  stagedCount: number;
  unstagedCount: number;
  untrackedCount: number;
  aheadCount: number;
  behindCount: number;
  lastCommitHash: string | null;
  lastCommitSubject: string | null;
  lastCommitDate: string | null;
  sanitizedRemoteUrl: string | null;
  remoteHost: string | null;
}

export interface GitRepository
{
  path: string;
  status: GitStatus;
}

// Run a git subcommand with safe argument arrays. Never uses a shell, never runs
// hooks. Returns trimmed stdout, or null on failure.
async function git(cwd: string, args: string[]): Promise<string | null>
{
  try
  {
    const { stdout } = await run(
      "git",
      ["-c", "core.hooksPath=/dev/null", ...args],
      { cwd, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
    );
    return stdout.trim();
  }
  catch
  {
    return null;
  }
}

async function isRepository(dir: string): Promise<boolean>
{
  try
  {
    // A .git directory (normal) or file (worktree/submodule) marks a repo root.
    await stat(join(dir, ".git"));
    return true;
  }
  catch
  {
    return false;
  }
}

function parseStatus(porcelain: string): Pick<
  GitStatus,
  | "branch"
  | "isDirty"
  | "stagedCount"
  | "unstagedCount"
  | "untrackedCount"
  | "aheadCount"
  | "behindCount"
>
{
  let branch: string | null = null;
  let staged = 0;
  let unstaged = 0;
  let untracked = 0;
  let ahead = 0;
  let behind = 0;

  for (const line of porcelain.split("\n"))
  {
    if (!line)
    {
      continue;
    }
    if (line.startsWith("## "))
    {
      const info = line.slice(3);
      branch = info.split(" ")[0]?.split("...")[0] ?? null;
      const aheadMatch = info.match(/ahead (\d+)/);
      const behindMatch = info.match(/behind (\d+)/);
      if (aheadMatch)
      {
        ahead = Number(aheadMatch[1]);
      }
      if (behindMatch)
      {
        behind = Number(behindMatch[1]);
      }
      continue;
    }
    if (line.startsWith("??"))
    {
      untracked += 1;
      continue;
    }
    const indexStatus = line[0];
    const worktreeStatus = line[1];
    if (indexStatus && indexStatus !== " ")
    {
      staged += 1;
    }
    if (worktreeStatus && worktreeStatus !== " ")
    {
      unstaged += 1;
    }
  }

  return {
    branch,
    isDirty: staged > 0 || unstaged > 0 || untracked > 0,
    stagedCount: staged,
    unstagedCount: unstaged,
    untrackedCount: untracked,
    aheadCount: ahead,
    behindCount: behind,
  };
}

export async function getGitStatus(repoPath: string): Promise<GitStatus>
{
  const porcelain = (await git(repoPath, ["status", "--porcelain=v1", "--branch"])) ?? "";
  const parsed = parseStatus(porcelain);

  const commit = await git(repoPath, [
    "log",
    "-1",
    "--pretty=format:%H%x00%ci%x00%s",
  ]);
  let lastCommitHash: string | null = null;
  let lastCommitDate: string | null = null;
  let lastCommitSubject: string | null = null;
  if (commit)
  {
    const [hash, date, subject] = commit.split("\u0000");
    lastCommitHash = hash ?? null;
    lastCommitDate = date ?? null;
    lastCommitSubject = subject ?? null;
  }

  const remote = await git(repoPath, ["remote", "get-url", "origin"]);
  const sanitized = sanitizeRemoteUrl(remote);

  return {
    ...parsed,
    lastCommitHash,
    lastCommitSubject,
    lastCommitDate,
    sanitizedRemoteUrl: sanitized.url,
    remoteHost: sanitized.host,
  };
}

// Find Git repositories under a root directory (not descending into found
// repositories or ignored directories), and capture each one's status.
export async function findRepositories(root: string): Promise<GitRepository[]>
{
  const repos: GitRepository[] = [];

  async function walk(dir: string): Promise<void>
  {
    if (await isRepository(dir))
    {
      repos.push({ path: dir, status: await getGitStatus(dir) });
      return; // do not descend into a repository
    }

    let entries;
    try
    {
      entries = await readdir(dir, { withFileTypes: true });
    }
    catch
    {
      return;
    }

    for (const entry of entries)
    {
      if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name))
      {
        await walk(join(dir, entry.name));
      }
    }
  }

  await walk(root);
  return repos;
}
