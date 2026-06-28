import { fileURLToPath } from "node:url";

// Repository root (apps/web -> ../../). Pins Next's file tracing to this
// monorepo and silences the "multiple lockfiles" detection warning.
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

// Server-only packages that must not be bundled: the native addons
// (better-sqlite3, argon2) and the workspace packages that load them and read
// the Drizzle migrations folder at runtime via import.meta.url.
const SERVER_EXTERNALS = [
  "@stirilo/db",
  "@stirilo/auth",
  "@stirilo/core",
  "better-sqlite3",
  "@node-rs/argon2",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: repoRoot,
  serverExternalPackages: ["better-sqlite3", "@node-rs/argon2"],
  // Linting is run separately via the repo-wide ESLint flat config (pnpm lint).
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { isServer }) =>
  {
    if (isServer)
    {
      config.externals = [...(config.externals ?? []), ...SERVER_EXTERNALS];
    }
    return config;
  },
};

export default nextConfig;
