import Link from "next/link";
import { notFound } from "next/navigation";
import { getScanTargetById } from "@/server/scan-targets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Scanning is implemented in a later phase.
          </CardDescription>
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
    </div>
  );
}
