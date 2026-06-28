import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getBooleanSetting,
  getNumberSetting,
  SETTING_KEYS,
} from "@/server/settings";
import {
  updateGitFetchOnScan,
  updateHistoryRetention,
} from "@/server/settings-actions";

export default function SettingsPage()
{
  const fetchOnScan = getBooleanSetting(SETTING_KEYS.gitFetchOnScan, false);
  const retentionDays = getNumberSetting(SETTING_KEYS.historyRetentionDays, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configuration for this Stirilo instance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Git scanning</CardTitle>
          <CardDescription>
            By default scans inspect local refs only. Enabling fetch makes scans
            contact each repository&apos;s remote (a network operation) so
            ahead/behind counts and the upstream commit date are accurate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateGitFetchOnScan} className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="gitFetchOnScan"
                defaultChecked={fetchOnScan}
                className="h-4 w-4"
              />
              Fetch from remotes during scan
            </label>
            <div>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History retention</CardTitle>
          <CardDescription>
            How long to keep scan runs, git snapshots, and health snapshots.
            Set to 0 to keep everything. Pruning runs after each scan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateHistoryRetention} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">Retention (days)</span>
              <input
                type="number"
                name="historyRetentionDays"
                min={0}
                defaultValue={retentionDays}
                className="w-32 rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <div>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
