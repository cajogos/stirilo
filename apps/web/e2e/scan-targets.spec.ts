import { test, expect, type Page } from "@playwright/test";

async function login(page: Page): Promise<void>
{
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/, { timeout: 20_000 });
}

test("adds a scan target with confirmation and lists it", async ({ page }) =>
{
  await login(page);
  await page.goto("/scan-targets");

  await page.getByLabel("Name", { exact: true }).fill("Etc");
  await page.getByLabel("Path", { exact: true }).fill("/etc");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Add scan target" }).click();

  await expect(page).toHaveURL(/\/scan-targets$/, { timeout: 20_000 });
  await expect(page.getByText("/etc", { exact: true })).toBeVisible();
});

test("rejects a non-existent path", async ({ page }) =>
{
  await login(page);
  await page.goto("/scan-targets");

  await page.getByLabel("Name", { exact: true }).fill("Nope");
  await page.getByLabel("Path", { exact: true }).fill("/no/such/directory/xyz");
  await page.getByRole("button", { name: "Add scan target" }).click();

  await expect(page.getByText(/Path does not exist/i)).toBeVisible({
    timeout: 20_000,
  });
});

test("runs a scan and shows the metadata summary", async ({ page }) =>
{
  await login(page);
  await page.goto("/scan-targets");

  // A small, stable fixture directory created by the web server command.
  await page.getByLabel("Name", { exact: true }).fill("Temp");
  await page.getByLabel("Path", { exact: true }).fill("/tmp/stirilo-scan-fixture");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Add scan target" }).click();
  await expect(page).toHaveURL(/\/scan-targets$/, { timeout: 20_000 });

  await page.getByRole("link", { name: "Temp" }).click();
  await page.getByRole("button", { name: "Run scan" }).click();

  await expect(page.getByText("Latest scan")).toBeVisible({ timeout: 20_000 });
  // The detected .env in the fixture should surface as a sensitive marker.
  await expect(page.getByText(/Sensitive markers/)).toBeVisible();

  // The fixture is a git repository, so the scan should detect it.
  await page.goto("/git");
  await expect(
    page.getByRole("link", { name: "stirilo-scan-fixture" }),
  ).toBeVisible({ timeout: 20_000 });
});
