import Link from "next/link";
import { basename } from "node:path";
import { listGitRepositories } from "@/server/git-repos";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";
import { formatBytes } from "@/lib/format";

export default function GitPage()
{
  const repos = listGitRepositories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Git repositories
        </h1>
        <p className="text-sm text-muted-foreground">
          Detected during scans. Remote URLs are stored without credentials.
        </p>
      </div>

      {repos.length === 0 ? (
        <EmptyState
          title="No repositories detected"
          description="Run a scan on a target that contains Git repositories."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repository</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Remote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repos.map(({ repo, status }) => (
                  <TableRow key={repo.id}>
                    <TableCell>
                      <Link
                        href={`/git/${repo.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {basename(repo.path)}
                      </Link>
                    </TableCell>
                    <TableCell>{status?.branch ?? "-"}</TableCell>
                    <TableCell>
                      {status?.isDirty ? (
                        <span className="text-destructive">Dirty</span>
                      ) : (
                        <span className="text-emerald-500">Clean</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {status ? formatBytes(status.sizeBytes) : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {repo.remoteHost ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
