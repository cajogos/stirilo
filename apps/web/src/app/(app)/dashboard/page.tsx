import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { getLatestScanRun, parseSummary } from "@/server/scans";
import { formatBytes } from "@/lib/format";

function StatCard({ label, value }: { label: string; value: string })
{
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function DashboardPage()
{
  const latest = getLatestScanRun();
  const summary = parseSummary(latest);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your local environment.
        </p>
      </div>

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Files (last scan)" value={String(summary.fileCount)} />
          <StatCard
            label="Directories"
            value={String(summary.directoryCount)}
          />
          <StatCard label="Total size" value={formatBytes(summary.totalSize)} />
          <StatCard
            label="Sensitive markers"
            value={String(summary.sensitiveMarkers.length)}
          />
        </div>
      ) : (
        <EmptyState
          title="No scans yet"
          description="Add a scan target and run a scan to populate the dashboard."
        />
      )}
    </div>
  );
}
