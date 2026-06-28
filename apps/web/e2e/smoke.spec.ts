import { test, expect } from "@playwright/test";

test("unauthenticated visit redirects to /login", async ({ page }) =>
{
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Sign in to Stirilo")).toBeVisible();
});

test("login leads to the dashboard and the shell loads", async ({ page }) =>
{
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Dashboard" }),
  ).toBeVisible();

  // The authenticated shell can navigate to settings.
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Settings" }),
  ).toBeVisible();
});
