import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBooleanSetting, SETTING_KEYS } from "@/server/settings";
import { updateGitFetchOnScan } from "@/server/settings-actions";

export default function SettingsPage()
{
  const fetchOnScan = getBooleanSetting(SETTING_KEYS.gitFetchOnScan, false);

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
    </div>
  );
}
