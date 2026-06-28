import "server-only";
import { evaluateAlerts, type Alert } from "@stirilo/core";
import { redact } from "@stirilo/redaction";
import { recordAudit } from "@stirilo/db";
import { getDb } from "@/server/db";
import {
  getBooleanSetting,
  getNumberSetting,
  getSetting,
  SETTING_KEYS,
} from "@/server/settings";
import { listHealthSnapshots } from "@/server/health-history";
import { getScanDiff } from "@/server/scan-diff";
import { listGitRepositories } from "@/server/git-repos";

function latestDiskPercent(): number | null
{
  const snapshots = listHealthSnapshots(1);
  const latest = snapshots[snapshots.length - 1];
  if (!latest || latest.diskTotal <= 0)
  {
    return null;
  }
  return Math.round(
    ((latest.diskTotal - latest.diskFree) / latest.diskTotal) * 100,
  );
}

// Send a redacted JSON payload to the configured webhook. Best-effort and
// time-boxed. Returns true on a 2xx response.
async function postWebhook(url: string, body: unknown): Promise<boolean>
{
  const payload = redact(JSON.stringify(body));
  try
  {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  }
  catch
  {
    return false;
  }
}

// Evaluate alert rules after a scan and dispatch any that fire. Every dispatch
// is audited. Payloads are redacted; alerts carry only counts and messages,
// never file contents or environment values.
export async function evaluateAndDispatchAlerts(
  targetId: string,
): Promise<Alert[]>
{
  const diff = getScanDiff(targetId);
  const dirtyRepoCount = listGitRepositories().filter(
    (r) => r.status?.isDirty,
  ).length;

  const alerts = evaluateAlerts({
    diskPercent: latestDiskPercent(),
    diskThresholdPercent: getNumberSetting(
      SETTING_KEYS.alertDiskThresholdPercent,
      0,
    ),
    addedSensitiveCount: diff?.addedSensitive.length ?? 0,
    alertOnSensitive: getBooleanSetting(SETTING_KEYS.alertOnSensitive, false),
    dirtyRepoCount,
    alertOnDirty: getBooleanSetting(SETTING_KEYS.alertOnDirty, false),
  });

  if (alerts.length === 0)
  {
    return [];
  }

  const db = getDb();
  const webhookUrl = getSetting(SETTING_KEYS.alertWebhookUrl);

  for (const alert of alerts)
  {
    let delivered = false;
    if (webhookUrl)
    {
      delivered = await postWebhook(webhookUrl, {
        kind: alert.kind,
        message: alert.message,
        targetId,
        at: new Date().toISOString(),
      });
    }
    recordAudit(db, {
      actor: "alerting",
      action: "alert_triggered",
      targetType: "scan_target",
      targetId,
      // redact() is defensive; messages already carry counts only.
      metadata: {
        kind: alert.kind,
        message: redact(alert.message),
        delivered,
      },
    });
  }

  return alerts;
}
