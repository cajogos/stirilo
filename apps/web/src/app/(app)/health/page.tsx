import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSystemSummary } from "@/server/system";
import { listHealthSnapshots } from "@/server/health-history";
import { Sparkline } from "@/components/charts/sparkline";
import { formatBytes } from "@/lib/format";

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

function formatUptime(seconds: number): string
{
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

function percentUsed(total: number, free: number): number
{
  if (total <= 0)
  {
    return 0;
  }
  return Math.round(((total - free) / total) * 100);
}

export default function HealthPage()
{
  const system = getSystemSummary();
  const snapshots = listHealthSnapshots();
  const memSeries = snapshots.map((s) => percentUsed(s.totalMemory, s.freeMemory));
  const diskSeries = snapshots.map((s) => percentUsed(s.diskTotal, s.diskFree));
  const latest = snapshots[snapshots.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System health</h1>
        <p className="text-sm text-muted-foreground">
          Read-only, non-privileged system information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Host</CardTitle>
          <CardDescription>Does not require elevated privileges.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Hostname" value={system.hostname} />
          <Field label="Platform" value={system.platform} />
          <Field label="Architecture" value={system.arch} />
          <Field label="Node.js" value={system.nodeVersion} />
          <Field label="Uptime" value={formatUptime(system.uptimeSeconds)} />
          <Field
            label="Memory used"
            value={`${formatBytes(system.totalMemory - system.freeMemory)} / ${formatBytes(system.totalMemory)}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trends</CardTitle>
          <CardDescription>
            Captured on each scan. Memory and disk usage over the last{" "}
            {snapshots.length} snapshot(s).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">
              Memory used{" "}
              {latest ? `(${percentUsed(latest.totalMemory, latest.freeMemory)}%)` : ""}
            </p>
            <div className="text-primary">
              <Sparkline values={memSeries} />
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">
              Disk used{" "}
              {latest ? `(${percentUsed(latest.diskTotal, latest.diskFree)}%)` : ""}
            </p>
            <div className="text-primary">
              <Sparkline values={diskSeries} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
