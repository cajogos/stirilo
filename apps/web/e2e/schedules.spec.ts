import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, expect, type Page } from "@playwright/test";

const auth = { Authorization: "Bearer e2e-agent-token-value" };

async function login(page: Page): Promise<void>
{
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
}

test("creates a schedule and the cron tick runs it", async ({ page, request }) =>
{
  const dir = mkdtempSync(join(tmpdir(), "stirilo-sched-"));
  writeFileSync(join(dir, "a.txt"), "x");
  const name = `Sched ${Date.now()}`;

  await login(page);

  // Add the scan target (in /tmp, so confirmation is required).
  await page.goto("/scan-targets");
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Path", { exact: true }).fill(dir);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Add scan target" }).click();
  await expect(page).toHaveURL(/\/scan-targets$/, { timeout: 20_000 });

  // Create an every-minute schedule for it.
  await page.goto("/schedules");
  await page.getByLabel("Target").selectOption({ label: name });
  await page.getByLabel("Interval (minutes)").fill("1");
  await page.getByRole("button", { name: "Add schedule" }).click();
  await expect(page.locator("tr", { hasText: name })).toBeVisible({
    timeout: 20_000,
  });

  // A brand-new schedule is immediately due: the tick runs it synchronously
  // (executeScan is awaited), so afterwards its last-run timestamp is set.
  const res = await request.post("/api/cron/tick", { headers: auth });
  expect(res.ok()).toBeTruthy();

  await page.reload();
  const row = page.locator("tr", { hasText: name });
  await expect(row).not.toContainText("Never", { timeout: 20_000 });
});
