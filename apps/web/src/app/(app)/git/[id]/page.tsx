import Link from "next/link";
import { basename } from "node:path";
import { notFound } from "next/navigation";
import { getGitRepository } from "@/server/git-repos";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBytes } from "@/lib/format";

interface GitRepoDetailProps
{
  params: Promise<{ id: string }>;
}

function Field({ label, value }: { label: string; value: string })
{
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm break-all">{value}</span>
    </div>
  );
}

export default async function GitRepoDetailPage({ params }: GitRepoDetailProps)
{
  const { id } = await params;
  const entry = getGitRepository(id);
  if (!entry)
  {
    notFound();
  }

  const { repo, status } = entry;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/git"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          &larr; Git repositories
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {basename(repo.path)}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repository</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Path" value={repo.path} />
          <Field label="Remote host" value={repo.remoteHost ?? "-"} />
          <Field
            label="Remote URL"
            value={repo.sanitizedRemoteUrl ?? "None"}
          />
          <Field label="Branch" value={status?.branch ?? "-"} />
        </CardContent>
      </Card>

      {status ? (
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Field label="State" value={status.isDirty ? "Dirty" : "Clean"} />
            <Field label="Size" value={formatBytes(status.sizeBytes)} />
            <Field label="Staged" value={String(status.stagedCount)} />
            <Field label="Unstaged" value={String(status.unstagedCount)} />
            <Field label="Untracked" value={String(status.untrackedCount)} />
            <Field label="Ahead" value={String(status.aheadCount)} />
            <Field label="Behind" value={String(status.behindCount)} />
            <Field
              label="Last commit"
              value={status.lastCommitSubject ?? "-"}
            />
            <Field
              label="Commit hash"
              value={status.lastCommitHash?.slice(0, 12) ?? "-"}
            />
            <Field label="Commit date" value={status.lastCommitDate ?? "-"} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
