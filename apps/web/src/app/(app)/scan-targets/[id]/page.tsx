import Link from "next/link";
import { notFound } from "next/navigation";
import { getScanTargetById } from "@/server/scan-targets";
import { getLatestScanRunForTarget, parseSummary } from "@/server/scans";
import { getScanDiff } from "@/server/scan-diff";
import { ScanRunButton } from "@/components/scan-run-button";
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
  const diff = getScanDiff(id);

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
        <ScanRunButton targetId={target.id} />
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

      {diff?.hasPrevious ? (
        <Card>
          <CardHeader>
            <CardTitle>Changes since previous scan</CardTitle>
            <CardDescription>
              Compared with the scan from {diff.previousAt?.slice(0, 19)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Files" value={signed(diff.fileCountDelta)} />
              <Field
                label="Total size"
                value={signedBytes(diff.totalSizeDelta)}
              />
              <Field
                label="Reclaimable"
                value={signedBytes(diff.reclaimableDelta)}
              />
            </div>
            {diff.addedSensitive.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-destructive">
                  New sensitive files ({diff.addedSensitive.length})
                </p>
                <ul className="mt-1 space-y-0.5 font-mono text-xs text-muted-foreground">
                  {diff.addedSensitive.map((m) => (
                    <li key={m.path}>
                      {m.path} ({m.rule})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {diff.removedSensitive.length > 0 ? (
              <div>
                <p className="text-sm font-medium">
                  Removed sensitive files ({diff.removedSensitive.length})
                </p>
                <ul className="mt-1 space-y-0.5 font-mono text-xs text-muted-foreground">
                  {diff.removedSensitive.map((m) => (
                    <li key={m.path}>
                      {m.path} ({m.rule})
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {diff.addedSensitive.length === 0 &&
            diff.removedSensitive.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No change in sensitive files.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function signed(n: number): string
{
  return n > 0 ? `+${n}` : String(n);
}

function signedBytes(n: number): string
{
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}${formatBytes(Math.abs(n))}`;
}
