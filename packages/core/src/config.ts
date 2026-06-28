import { z } from "zod";

// Environment configuration for Stirilo. Non-secret fields have safe local
// defaults; the auth secrets are optional here and become required in Phase 2b.
export const configSchema = z.object({
  STIRILO_APP_URL: z.string().url().default("http://localhost:3157"),
  STIRILO_BIND_HOST: z.string().min(1).default("127.0.0.1"),
  STIRILO_PORT: z.coerce.number().int().positive().max(65535).default(3157),
  STIRILO_DB_PATH: z.string().min(1).default("./data/stirilo.dev.db"),
  STIRILO_USERNAME: z.string().min(1, "STIRILO_USERNAME is required"),
  STIRILO_PASSWORD_HASH: z.string().min(1, "STIRILO_PASSWORD_HASH is required"),
  STIRILO_SESSION_SECRET: z
    .string()
    .min(16, "STIRILO_SESSION_SECRET must be at least 16 characters"),
  // Treat an empty string as unset so a blank `.env` line is allowed.
  STIRILO_AGENT_TOKEN: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
});

export type Config = z.infer<typeof configSchema>;

export type EnvSource = Record<string, string | undefined>;

// Validate and return the configuration. Throws a readable, aggregated error so
// the app fails fast at startup rather than misbehaving later.
export function loadConfig(env: EnvSource = process.env): Config
{
  const result = configSchema.safeParse(env);
  if (!result.success)
  {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid Stirilo configuration:\n${issues}`);
  }

  return result.data;
}
