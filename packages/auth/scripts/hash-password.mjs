// Generate an argon2id hash for STIRILO_PASSWORD_HASH.
// Usage (keeps the password out of shell history):
//   read -s -p "Password: " p; echo; printf %s "$p" | pnpm hash:password
import { Algorithm, hash } from "@node-rs/argon2";

async function readStdin()
{
  const chunks = [];
  for await (const chunk of process.stdin)
  {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
}

const password = (process.argv[2] ?? (await readStdin())).trim();
if (!password)
{
  console.error("No password provided on argv or stdin.");
  process.exit(1);
}

const digest = await hash(password, { algorithm: Algorithm.Argon2id });
console.log(digest);
