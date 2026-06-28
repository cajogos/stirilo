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

  // The session persists across a refresh.
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Dashboard" }),
  ).toBeVisible();

  // The authenticated shell can navigate to settings.
  await page.goto("/settings");
  await expect(
    page.getByRole("heading", { name: "Settings" }),
  ).toBeVisible();

  // Logging out clears the session and returns to /login.
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("invalid credentials are rejected", async ({ page }) =>
{
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/login\?error=invalid$/, { timeout: 20_000 });
  await expect(
    page.getByText("Invalid username or password."),
  ).toBeVisible({ timeout: 20_000 });
});
