import { listSchedules } from "@/server/schedules";
import { listScanTargets } from "@/server/scan-targets";
import {
  createScheduleAction,
  deleteScheduleAction,
  toggleScheduleAction,
} from "@/server/schedule-actions";
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

export default function SchedulesPage()
{
  const schedules = listSchedules();
  const targets = listScanTargets();
  const targetName = (id: string | null): string =>
    id === null
      ? "All enabled targets"
      : (targets.find((t) => t.id === id)?.name ?? "(deleted target)");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
        <p className="text-sm text-muted-foreground">
          Run scans automatically at a fixed interval. A due schedule runs when
          the tick endpoint (<code>POST /api/cron/tick</code>) is called - point
          a system cron at it (e.g. every minute) with the agent token.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a schedule</CardTitle>
          <CardDescription>
            Choose a target (or all enabled targets) and an interval in minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={createScheduleAction}
            className="flex flex-wrap items-end gap-4"
          >
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Target</span>
              <select
                name="scanTargetId"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">All enabled targets</option>
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Interval (minutes)</span>
              <input
                type="number"
                name="intervalMinutes"
                min={1}
                defaultValue={60}
                className="w-32 rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <Button type="submit">Add schedule</Button>
          </form>
        </CardContent>
      </Card>

      {schedules.length === 0 ? (
        <EmptyState
          title="No schedules"
          description="Add a schedule to run scans automatically."
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Target</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Last run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{targetName(s.scanTargetId)}</TableCell>
                    <TableCell>{s.intervalMinutes} min</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.lastRunAt?.slice(0, 19) ?? "Never"}
                    </TableCell>
                    <TableCell>{s.enabled ? "Enabled" : "Disabled"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <form action={toggleScheduleAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <input
                            type="hidden"
                            name="enabled"
                            value={s.enabled ? "false" : "true"}
                          />
                          <Button type="submit" variant="outline" size="sm">
                            {s.enabled ? "Disable" : "Enable"}
                          </Button>
                        </form>
                        <form action={deleteScheduleAction}>
                          <input type="hidden" name="id" value={s.id} />
                          <Button
                            type="submit"
                            variant="destructive"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </form>
                      </div>
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
