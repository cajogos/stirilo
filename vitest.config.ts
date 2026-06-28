import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    // No feature code yet; the suite passes with zero tests until packages add them.
    passWithNoTests: true,
    include: ["packages/**/*.{test,spec}.ts", "apps/**/*.{test,spec}.ts"],
    // Playwright e2e specs are run by Playwright, not Vitest.
    exclude: [...configDefaults.exclude, "**/e2e/**"],
  },
});
