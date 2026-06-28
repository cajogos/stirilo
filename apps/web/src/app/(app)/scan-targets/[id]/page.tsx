import Link from "next/link";
import { notFound } from "next/navigation";
import { getScanTargetById } from "@/server/scan-targets";
import { getLatestScanRunForTarget, parseSummary } from "@/server/scans";
import { runScan } from "@/server/scan-run-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { formatBytes } from "@/lib/format";

interface ScanTargetDetailProps
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
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}

export default async function ScanTargetDetailPage({
  params,
}: ScanTargetDetailProps)
{
  const { id } = await params;
  const target = getScanTargetById(id);
  if (!target)
  {
    notFound();
  }

  const latestRun = getLatestScanRunForTarget(id);
  const summary = parseSummary(latestRun);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/scan-targets"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            &larr; Scan targets
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {target.name}
          </h1>
        </div>
        <form action={runScan}>
          <input type="hidden" name="targetId" value={target.id} />
          <Button type="submit">Run scan</Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Path" value={target.path} />
          <Field label="Enabled" value={target.enabled ? "Yes" : "No"} />
          <Field label="Created" value={target.createdAt} />
          <Field
            label="Last scan"
            value={target.lastScanStatus ?? "Never scanned"}
          />
        </CardContent>
      </Card>

      {summary ? (
        <Card>
          <CardHeader>
            <CardTitle>Latest scan</CardTitle>
            <CardDescription>
              Metadata only. Sensitive files are detected, never read.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Field label="Files" value={String(summary.fileCount)} />
            <Field label="Directories" value={String(summary.directoryCount)} />
            <Field label="Total size" value={formatBytes(summary.totalSize)} />
            <Field
              label="Sensitive markers"
              value={String(summary.sensitiveMarkers.length)}
            />
            <Field
              label="Project markers"
              value={summary.projectMarkers.join(", ") || "None"}
            />
            <Field label="Scan time" value={`${summary.durationMs} ms`} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No scans yet"
          description="Run a scan to collect metadata for this directory."
        />
      )}
    </div>
  );
}
