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
  // Last commit date on the tracked upstream branch. Only populated when a
  // fetch was performed (otherwise it reflects local refs, so it is left null).
  remoteLastCommitDate: string | null;
  sanitizedRemoteUrl: string | null;
  remoteHost: string | null;
}

export interface GitStatusOptions
{
  // When true, run `git fetch` before computing status so ahead/behind and the
  // remote last-commit date reflect the true remote. Off by default: fetching
  // is a network operation and a behavior change from pure local inspection.
  fetch?: boolean;
}

// Network operations (fetch) get a bounded timeout so a slow or hanging remote
// never stalls a scan.
const FETCH_TIMEOUT_MS = 15_000;

export interface GitRepository
{
  path: string;
  sizeBytes: number;
  status: GitStatus;
}

// Run a git subcommand with safe argument arrays. Never uses a shell, never runs
// hooks. Returns trimmed stdout, or null on failure.
async function git(
  cwd: string,
  args: string[],
  timeout = 0,
): Promise<string | null>
{
  try
  {
    const { stdout } = await run(
      "git",
      ["-c", "core.hooksPath=/dev/null", ...args],
      { cwd, windowsHide: true, maxBuffer: 4 * 1024 * 1024, timeout },
    );
    return stdout.trim();
  }
  catch
  {
    return null;
  }
}

// Sum the size of a repository's working-tree files (metadata only, never reads
// contents). Skips the .git directory and ignored directories; symlinks are not
// followed.
async function directorySize(root: string): Promise<number>
{
  let total = 0;

  async function walk(dir: string): Promise<void>
  {
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
      if (entry.isDirectory())
      {
        if (entry.name === ".git" || IGNORED_DIRECTORIES.has(entry.name))
        {
          continue;
        }
        await walk(join(dir, entry.name));
      }
      else if (entry.isFile())
      {
        try
        {
          const stats = await stat(join(dir, entry.name));
          total += stats.size;
        }
        catch
        {
          // Unreadable file: skip.
        }
      }
    }
  }

  await walk(root);
  return total;
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

export async function getGitStatus(
  repoPath: string,
  options: GitStatusOptions = {},
): Promise<GitStatus>
{
  // Optional, off-by-default network fetch so ahead/behind and the upstream
  // commit date reflect the true remote. Best-effort and time-boxed.
  if (options.fetch)
  {
    await git(repoPath, ["fetch", "--quiet", "--no-tags"], FETCH_TIMEOUT_MS);
  }

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

  // Upstream last-commit date is only meaningful after a fetch; left null
  // otherwise so the UI never implies stale local refs are remote truth.
  let remoteLastCommitDate: string | null = null;
  if (options.fetch)
  {
    remoteLastCommitDate =
      (await git(repoPath, ["log", "-1", "--pretty=format:%ci", "@{u}"])) || null;
  }

  const remote = await git(repoPath, ["remote", "get-url", "origin"]);
  const sanitized = sanitizeRemoteUrl(remote);

  return {
    ...parsed,
    lastCommitHash,
    lastCommitSubject,
    lastCommitDate,
    remoteLastCommitDate,
    sanitizedRemoteUrl: sanitized.url,
    remoteHost: sanitized.host,
  };
}

// Find Git repositories under a root directory, including repositories nested
// inside other repositories. Descends into found repos (skipping their `.git`
// directory and ignored directories); symlinks are not followed.
export async function findRepositories(
  root: string,
  onRepo?: (repo: GitRepository) => void,
  options: GitStatusOptions = {},
): Promise<GitRepository[]>
{
  const repos: GitRepository[] = [];

  async function walk(dir: string): Promise<void>
  {
    if (await isRepository(dir))
    {
      const repo: GitRepository = {
        path: dir,
        sizeBytes: await directorySize(dir),
        status: await getGitStatus(dir, options),
      };
      repos.push(repo);
      onRepo?.(repo);
      // Keep descending to find nested repositories.
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
      if (
        entry.isDirectory() &&
        entry.name !== ".git" &&
        !IGNORED_DIRECTORIES.has(entry.name)
      )
      {
        await walk(join(dir, entry.name));
      }
    }
  }

  await walk(root);
  return repos;
}
