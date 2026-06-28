import { readFileSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Repository root (apps/web -> ../../). Pins Next's file tracing to this
// monorepo and silences the "multiple lockfiles" detection warning.
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

// Stirilo's configuration lives in a single .env at the monorepo root, but Next
// only auto-loads .env from the app directory. Load the root file here, without
// overriding variables already present in the environment (so tests and the
// shell take precedence, matching dotenv/--env-file semantics).
function loadRootEnv(file)
{
  let content;
  try
  {
    content = readFileSync(file, "utf8");
  }
  catch
  {
    // No .env yet (e.g. before `pnpm setup`); the config loader will report it.
    return;
  }

  for (const line of content.split("\n"))
  {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#"))
    {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1)
    {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (key in process.env)
    {
      continue;
    }
    let value = trimmed.slice(eq + 1).trim();
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    )
    {
      value = value.slice(1, -1);
    }
    // A blank value (e.g. `STIRILO_AGENT_TOKEN=`) means "unset", not "".
    if (value === "")
    {
      continue;
    }
    process.env[key] = value;
  }
}

loadRootEnv(join(repoRoot, ".env"));

// Resolve a relative DB path against the repo root so the database lives in
// ./data regardless of the directory Next is launched from.
if (process.env.STIRILO_DB_PATH && !isAbsolute(process.env.STIRILO_DB_PATH))
{
  process.env.STIRILO_DB_PATH = resolve(repoRoot, process.env.STIRILO_DB_PATH);
}

// Server-only packages that must not be bundled: the native addons
// (better-sqlite3, argon2) and the workspace packages that load them and read
// the Drizzle migrations folder at runtime via import.meta.url.
const SERVER_EXTERNALS = [
  "@stirilo/db",
  "@stirilo/auth",
  "@stirilo/core",
  "@stirilo/scanner",
  "@stirilo/redaction",
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
