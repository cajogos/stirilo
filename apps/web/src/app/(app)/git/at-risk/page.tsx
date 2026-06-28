import Link from "next/link";
import { getGitAtRisk, type RiskRepo } from "@/server/git-intel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GitAtRiskPage()
{
  const data = getGitAtRisk();

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
          At-risk repositories
        </h1>
        <p className="text-sm text-muted-foreground">
          Cross-repo risks derived from the latest scan. Repositories with no
          remote hold work that exists only on this machine.
        </p>
      </div>

      {!data.hasData ? (
        <EmptyState
          title="No repositories detected"
          description="Run a scan on a target that contains Git repositories."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <Stat label="Repositories" value={data.counts.total} />
            <Stat label="No remote" value={data.counts.noRemote} danger />
            <Stat label="Unpushed" value={data.counts.unpushed} />
            <Stat label="Dirty" value={data.counts.dirty} />
            <Stat label="Stale" value={data.counts.stale} />
          </div>

          <RiskSection
            title="No remote (loss risk)"
            description="Work exists only locally; a disk loss loses it."
            repos={data.noRemote}
          />
          <RiskSection
            title="Unpushed commits"
            description="Local commits not yet on the upstream remote."
            repos={data.unpushed}
          />
          <RiskSection
            title="Uncommitted changes"
            description="Working trees with staged, unstaged, or untracked changes."
            repos={data.dirty}
          />
          <RiskSection
            title={`Stale (no commit in ${data.staleThresholdDays}+ days)`}
            description="Repositories that may be abandoned or finished."
            repos={data.stale}
          />

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Most recently committed repositories.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repository</TableHead>
                    <TableHead>Last commit</TableHead>
                    <TableHead>Subject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.activity.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link
                          href={`/git/${r.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {r.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.lastCommitDate?.slice(0, 10) ?? "-"}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {r.lastCommitSubject ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
})
{
  return (
    <Card className="min-w-32">
      <CardContent className="pt-6">
        <p
          className={
            danger && value > 0
              ? "text-2xl font-semibold text-destructive"
              : "text-2xl font-semibold"
          }
        >
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function RiskSection({
  title,
  description,
  repos,
}: {
  title: string;
  description: string;
  repos: RiskRepo[];
})
{
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title}{" "}
          <span className="text-muted-foreground">({repos.length})</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {repos.length === 0 ? (
          <p className="text-sm text-muted-foreground">None.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repos.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/git/${r.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {r.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.branch ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.detail}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
