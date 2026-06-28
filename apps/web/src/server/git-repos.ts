import "server-only";
import { desc, eq } from "drizzle-orm";
import {
  gitRepositories,
  gitStatusSnapshots,
  type GitRepositoryRow,
  type GitStatusSnapshot,
} from "@stirilo/db";
import { getDb } from "@/server/db";

export interface GitRepoWithStatus
{
  repo: GitRepositoryRow;
  status: GitStatusSnapshot | null;
}

function latestSnapshot(repoId: string): GitStatusSnapshot | null
{
  const rows = getDb()
    .select()
    .from(gitStatusSnapshots)
    .where(eq(gitStatusSnapshots.gitRepositoryId, repoId))
    .orderBy(desc(gitStatusSnapshots.createdAt))
    .limit(1)
    .all();
  return rows[0] ?? null;
}

export function listGitRepositories(): GitRepoWithStatus[]
{
  const repos = getDb()
    .select()
    .from(gitRepositories)
    .orderBy(desc(gitRepositories.updatedAt))
    .all();
  return repos.map((repo) => ({ repo, status: latestSnapshot(repo.id) }));
}

export function getGitRepository(id: string): GitRepoWithStatus | null
{
  const rows = getDb()
    .select()
    .from(gitRepositories)
    .where(eq(gitRepositories.id, id))
    .all();
  const repo = rows[0];
  return repo ? { repo, status: latestSnapshot(repo.id) } : null;
}
