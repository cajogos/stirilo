import Link from "next/link";
import { createScanTarget } from "@/server/scan-target-actions";
import { listScanTargets } from "@/server/scan-targets";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/states";

interface ScanTargetsPageProps
{
  searchParams: Promise<{ error?: string; confirm?: string }>;
}

export default async function ScanTargetsPage({
  searchParams,
}: ScanTargetsPageProps)
{
  const { error, confirm } = await searchParams;
  const targets = listScanTargets();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scan targets</h1>
        <p className="text-sm text-muted-foreground">
          Local directories Stirilo is allowed to inspect.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a scan target</CardTitle>
          <CardDescription>
            The path must exist, be a readable directory, and not be a blocked
            system location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <form action={createScanTarget} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                name="name"
                placeholder="My projects"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="path" className="text-sm font-medium">
                Path
              </label>
              <input
                id="path"
                name="path"
                placeholder="~/projects"
                className="h-9 rounded-md border border-input bg-background px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="confirm"
                defaultChecked={confirm === "1"}
                className="h-4 w-4 rounded border-input"
              />
              I confirm adding a sensitive or home/system path.
            </label>
            <Button type="submit" className="self-start">
              Add scan target
            </Button>
          </form>
        </CardContent>
      </Card>

      {targets.length === 0 ? (
        <EmptyState
          title="No scan targets yet"
          description="Add a directory above to start tracking it."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Last scan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {targets.map((target) => (
                  <TableRow key={target.id}>
                    <TableCell>
                      <Link
                        href={`/scan-targets/${target.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {target.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {target.path}
                    </TableCell>
                    <TableCell>{target.enabled ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {target.lastScanStatus ?? "Never"}
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
