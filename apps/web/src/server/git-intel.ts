import "server-only";
import { basename } from "node:path";
import { listGitRepositories, type GitRepoWithStatus } from "@/server/git-repos";

// Cross-repo "at-risk" analysis derived from the latest status snapshot of each
// repository. A pure consumer of already-scanned data: no git commands here.

export interface RiskRepo
{
  id: string;
  name: string;
  path: string;
  branch: string | null;
  detail: string;
}

export interface ActivityRepo
{
  id: string;
  name: string;
  path: string;
  lastCommitDate: string | null;
  lastCommitSubject: string | null;
}

export interface GitAtRisk
{
  dirty: RiskRepo[];
  unpushed: RiskRepo[];
  noRemote: RiskRepo[];
  stale: RiskRepo[];
  activity: ActivityRepo[];
  counts: {
    total: number;
    dirty: number;
    unpushed: number;
    noRemote: number;
    stale: number;
  };
  staleThresholdDays: number;
  hasData: boolean;
}

// A repository whose last commit is older than this is considered stale.
const STALE_DAYS = 180;

function ageInDays(iso: string | null): number | null
{
  if (!iso)
  {
    return null;
  }
  const then = Date.parse(iso);
  if (Number.isNaN(then))
  {
    return null;
  }
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

function toRisk(entry: GitRepoWithStatus, detail: string): RiskRepo
{
  return {
    id: entry.repo.id,
    name: basename(entry.repo.path),
    path: entry.repo.path,
    branch: entry.status?.branch ?? null,
    detail,
  };
}

export function getGitAtRisk(): GitAtRisk
{
  const repos = listGitRepositories();
  const dirty: RiskRepo[] = [];
  const unpushed: RiskRepo[] = [];
  const noRemote: RiskRepo[] = [];
  const stale: RiskRepo[] = [];

  for (const entry of repos)
  {
    const s = entry.status;
    if (s?.isDirty)
    {
      const parts = [
        s.stagedCount ? `${s.stagedCount} staged` : null,
        s.unstagedCount ? `${s.unstagedCount} unstaged` : null,
        s.untrackedCount ? `${s.untrackedCount} untracked` : null,
      ].filter(Boolean);
      dirty.push(toRisk(entry, parts.join(", ") || "uncommitted changes"));
    }
    if (s && s.aheadCount > 0)
    {
      unpushed.push(
        toRisk(entry, `${s.aheadCount} commit(s) ahead of upstream`),
      );
    }
    if (!entry.repo.sanitizedRemoteUrl)
    {
      noRemote.push(toRisk(entry, "no remote configured"));
    }
    const age = ageInDays(s?.lastCommitDate ?? null);
    if (age !== null && age > STALE_DAYS)
    {
      stale.push(toRisk(entry, `no commit in ${Math.floor(age)} days`));
    }
  }

  const activity: ActivityRepo[] = repos
    .map((entry) => ({
      id: entry.repo.id,
      name: basename(entry.repo.path),
      path: entry.repo.path,
      lastCommitDate: entry.status?.lastCommitDate ?? null,
      lastCommitSubject: entry.status?.lastCommitSubject ?? null,
    }))
    .sort((a, b) =>
      (b.lastCommitDate ?? "").localeCompare(a.lastCommitDate ?? ""),
    )
    .slice(0, 15);

  return {
    dirty,
    unpushed,
    noRemote,
    stale,
    activity,
    counts: {
      total: repos.length,
      dirty: dirty.length,
      unpushed: unpushed.length,
      noRemote: noRemote.length,
      stale: stale.length,
    },
    staleThresholdDays: STALE_DAYS,
    hasData: repos.length > 0,
  };
}
