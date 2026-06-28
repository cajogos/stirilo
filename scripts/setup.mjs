// Interactive setup: configure the single-user credentials and session secret,
// then write them to .env. Run with `pnpm setup`.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { Algorithm, hash } from "@node-rs/argon2";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const envPath = process.env.STIRILO_ENV_FILE ?? join(repoRoot, ".env");
const examplePath = join(repoRoot, ".env.example");

const isTty = Boolean(process.stdin.isTTY);

// Interactive prompts use a readline interface; piped input is read once upfront
// (sequential readline questions do not resolve on a non-TTY stream).
let rl = null;
let pipedLines = null;
let muted = false;

async function init()
{
  if (isTty)
  {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    rl._writeToOutput = (str) =>
    {
      if (!muted)
      {
        rl.output.write(str);
      }
    };
  }
  else
  {
    const chunks = [];
    for await (const chunk of process.stdin)
    {
      chunks.push(chunk);
    }
    pipedLines = Buffer.concat(chunks).toString("utf8").split("\n");
  }
}

function ask(query)
{
  if (!isTty)
  {
    process.stdout.write(query);
    return Promise.resolve((pipedLines.shift() ?? "").trim());
  }
  return new Promise((resolve) =>
    rl.question(query, (answer) => resolve(answer.trim())),
  );
}

function askHidden(query)
{
  if (!isTty)
  {
    return ask(query);
  }
  return new Promise((resolve) =>
  {
    process.stdout.write(query);
    muted = true;
    rl.question("", (answer) =>
    {
      muted = false;
      rl.output.write("\n");
      resolve(answer.trim());
    });
  });
}

// Replace KEY=... in place, or append it if absent. Preserves other lines.
function upsert(lines, key, value)
{
  const prefix = `${key}=`;
  const index = lines.findIndex((line) => line.startsWith(prefix));
  const next = `${key}=${value}`;
  if (index === -1)
  {
    lines.push(next);
  }
  else
  {
    lines[index] = next;
  }
  return lines;
}

function valueOf(lines, key)
{
  const prefix = `${key}=`;
  const line = lines.find((entry) => entry.startsWith(prefix));
  return line ? line.slice(prefix.length) : "";
}

async function main()
{
  await init();
  console.log("Stirilo setup\n");

  // Start from the existing .env, falling back to the example template.
  let base = "";
  if (existsSync(envPath))
  {
    base = readFileSync(envPath, "utf8");
    console.log(`Updating existing ${envPath}\n`);
  }
  else if (existsSync(examplePath))
  {
    base = readFileSync(examplePath, "utf8");
    console.log(`Creating ${envPath} from .env.example\n`);
  }
  const lines = base.split("\n");

  const currentUser = valueOf(lines, "STIRILO_USERNAME") || "admin";
  const username = (await ask(`Username [${currentUser}]: `)) || currentUser;

  const password = await askHidden("Password: ");
  if (!password)
  {
    console.error("\nError: password must not be empty.");
    process.exit(1);
  }
  const confirm = await askHidden("Confirm password: ");
  if (password !== confirm)
  {
    console.error("\nError: passwords do not match.");
    process.exit(1);
  }

  const passwordHash = await hash(password, { algorithm: Algorithm.Argon2id });

  upsert(lines, "STIRILO_USERNAME", username);
  upsert(lines, "STIRILO_PASSWORD_HASH", passwordHash);

  // Only generate a session secret if one is not already set, so existing
  // sessions are not invalidated on re-run.
  const existingSecret = valueOf(lines, "STIRILO_SESSION_SECRET");
  if (!existingSecret)
  {
    upsert(lines, "STIRILO_SESSION_SECRET", randomBytes(32).toString("hex"));
    console.log("\nGenerated a new STIRILO_SESSION_SECRET.");
  }

  const output = lines.join("\n").replace(/\n*$/, "\n");
  writeFileSync(envPath, output, { mode: 0o600 });
  rl?.close();

  console.log(`\nWrote ${envPath}`);
  console.log(`  user: ${username}`);
  console.log("  password: stored as an argon2id hash");
  console.log(
    "\nStart the app with `pnpm dev` and sign in at http://127.0.0.1:3157",
  );
}

main().catch((error) =>
{
  console.error(error);
  process.exit(1);
});
