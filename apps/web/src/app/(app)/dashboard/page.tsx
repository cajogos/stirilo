import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { getDashboardData } from "@/server/dashboard";
import { getSystemSummary } from "@/server/system";
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
  const data = getDashboardData();
  const system = getSystemSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your local environment.
        </p>
      </div>

      {data.hasData ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Tracked directories"
              value={String(data.scanTargetCount)}
            />
            <StatCard
              label="Git repositories"
              value={String(data.repoCount)}
            />
            <StatCard
              label="Dirty repositories"
              value={String(data.dirtyRepoCount)}
            />
            <StatCard
              label="Last scan"
              value={data.lastScanStatus ?? "Never"}
            />
            <StatCard
              label="Sensitive markers"
              value={String(data.sensitiveMarkerCount)}
            />
            <StatCard
              label="Files (last scan)"
              value={String(data.fileCount)}
            />
            <StatCard
              label="Total size (last scan)"
              value={formatBytes(data.totalSize)}
            />
            <StatCard
              label="Largest file"
              value={
                data.largestFile
                  ? formatBytes(data.largestFile.size)
                  : "-"
              }
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System</CardTitle>
              <CardDescription>
                Read-only, non-privileged host information.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <span>Host: {system.hostname}</span>
              <span>
                Platform: {system.platform} ({system.arch})
              </span>
              <span>Node: {system.nodeVersion}</span>
              <span>
                Memory: {formatBytes(system.totalMemory - system.freeMemory)} /{" "}
                {formatBytes(system.totalMemory)}
              </span>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          title="No scans yet"
          description="Add a scan target and run a scan to populate the dashboard."
        />
      )}
    </div>
  );
}
