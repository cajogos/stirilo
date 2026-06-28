import { defineConfig, devices } from "@playwright/test";

// Use a dedicated port (not the dev default 3157) so the e2e server never
// collides with a running `pnpm dev`, which reuseExistingServer would otherwise
// pick up with the wrong environment.
const PORT = Number(process.env.E2E_PORT ?? 3211);
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Use a production build for deterministic timing (no per-route dev compile).
    command: `pnpm build && pnpm exec next start -p ${PORT} -H 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Test-only single-user credentials. The hash is argon2id("password") and is
    // a throwaway fixture, not a real secret. The DB lives in a temp directory.
    env: {
      STIRILO_USERNAME: "admin",
      STIRILO_PASSWORD_HASH:
        "$argon2id$v=19$m=19456,t=2,p=1$qKWdXixdua4QKEitnLkzEw$YnREw1dDBlBTwIhdoLm0AKnXcXAFrKwUFHkXAInSWXs",
      STIRILO_SESSION_SECRET: "e2e-only-session-secret-value",
      STIRILO_DB_PATH: "/tmp/stirilo-e2e/test.db",
    },
  },
});
