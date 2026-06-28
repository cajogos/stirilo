import { basename } from "node:path";
import Link from "next/link";
import { listGitRepositories } from "@/server/git-repos";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import {
  GitReposTable,
  type GitRepoRow,
} from "@/components/git/git-repos-table";

export default function GitPage()
{
  const rows: GitRepoRow[] = listGitRepositories().map(({ repo, status }) => ({
    id: repo.id,
    name: basename(repo.path),
    path: repo.path,
    branch: status?.branch ?? null,
    isDirty: status?.isDirty ?? false,
    stagedCount: status?.stagedCount ?? 0,
    unstagedCount: status?.unstagedCount ?? 0,
    untrackedCount: status?.untrackedCount ?? 0,
    aheadCount: status?.aheadCount ?? 0,
    behindCount: status?.behindCount ?? 0,
    sizeBytes: status?.sizeBytes ?? 0,
    lastCommitDate: status?.lastCommitDate ?? null,
    lastCommitSubject: status?.lastCommitSubject ?? null,
    remoteHost: repo.remoteHost ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Git repositories
        </h1>
        <p className="text-sm text-muted-foreground">
          Detected during scans. Remote URLs are stored without credentials.
          Click a column header to sort.
        </p>
        <Link
          href="/git/at-risk"
          className="mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline"
        >
          View at-risk repositories &rarr;
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No repositories detected"
          description="Run a scan on a target that contains Git repositories."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <GitReposTable rows={rows} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
