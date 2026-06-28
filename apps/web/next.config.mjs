import { fileURLToPath } from "node:url";

// Repository root (apps/web -> ../../). Pins Next's file tracing to this
// monorepo and silences the "multiple lockfiles" detection warning.
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: repoRoot,
  // Keep the native better-sqlite3 binding out of the bundler (used from Phase 2a).
  serverExternalPackages: ["better-sqlite3"],
  // Linting is run separately via the repo-wide ESLint flat config (pnpm lint).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
