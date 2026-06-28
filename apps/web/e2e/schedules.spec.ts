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

  // Create the target via the API (deterministic) so the test focuses on the
  // scheduling feature, not the create-target form.
  const created = await request.post("/api/scan-targets", {
    headers: auth,
    data: { name, path: dir, confirm: true },
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();

  await login(page);

  // Create an every-minute schedule for the target, selected by its id.
  await page.goto("/schedules");
  await page.getByLabel("Target").selectOption(id);
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
