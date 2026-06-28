import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSystemSummary } from "@/server/system";
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

export default function HealthPage()
{
  const system = getSystemSummary();

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
    </div>
  );
}
