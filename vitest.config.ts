import { fileURLToPath } from "node:url";
import { defineConfig, configDefaults } from "vitest/config";

const pkg = (name) =>
  fileURLToPath(new URL(`./packages/${name}/src/index.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    // Run unit tests against package source, independent of build output.
    alias: {
      "@stirilo/core": pkg("core"),
      "@stirilo/db": pkg("db"),
      "@stirilo/auth": pkg("auth"),
      "@stirilo/redaction": pkg("redaction"),
    },
  },
  test: {
    // No feature code yet; the suite passes with zero tests until packages add them.
    passWithNoTests: true,
    include: ["packages/**/*.{test,spec}.ts", "apps/**/*.{test,spec}.ts"],
    // Playwright e2e specs are run by Playwright, not Vitest.
    exclude: [...configDefaults.exclude, "**/e2e/**"],
  },
});
