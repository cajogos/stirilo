// Pure scheduling + alert-evaluation helpers, kept free of any I/O so they can
// be unit tested directly. The server layer owns persistence and dispatch.

// Whether an interval schedule is due to run. A schedule that has never run is
// always due. Interval scheduling (every N minutes) is used instead of full
// cron expressions to avoid a parser dependency in v0.1.
export function isScheduleDue(
  lastRunAt: string | null,
  intervalMinutes: number,
  now: number,
): boolean
{
  if (intervalMinutes <= 0)
  {
    return false;
  }
  if (!lastRunAt)
  {
    return true;
  }
  const last = Date.parse(lastRunAt);
  if (Number.isNaN(last))
  {
    return true;
  }
  return now - last >= intervalMinutes * 60 * 1000;
}

export interface AlertConditions
{
  diskPercent: number | null;
  diskThresholdPercent: number;
  addedSensitiveCount: number;
  alertOnSensitive: boolean;
  dirtyRepoCount: number;
  alertOnDirty: boolean;
}

export interface Alert
{
  kind: "disk" | "sensitive" | "dirty";
  message: string;
}

// Decide which alerts fire for a set of observed conditions. Pure and
// deterministic so the rules are easy to test.
export function evaluateAlerts(c: AlertConditions): Alert[]
{
  const alerts: Alert[] = [];

  if (
    c.diskThresholdPercent > 0 &&
    c.diskPercent !== null &&
    c.diskPercent >= c.diskThresholdPercent
  )
  {
    alerts.push({
      kind: "disk",
      message: `Disk usage ${c.diskPercent}% is at or above the ${c.diskThresholdPercent}% threshold.`,
    });
  }

  if (c.alertOnSensitive && c.addedSensitiveCount > 0)
  {
    alerts.push({
      kind: "sensitive",
      message: `${c.addedSensitiveCount} new sensitive file marker(s) detected since the previous scan.`,
    });
  }

  if (c.alertOnDirty && c.dirtyRepoCount > 0)
  {
    alerts.push({
      kind: "dirty",
      message: `${c.dirtyRepoCount} repository(ies) have uncommitted changes.`,
    });
  }

  return alerts;
}
