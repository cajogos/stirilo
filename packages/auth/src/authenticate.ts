import { createHash, timingSafeEqual } from "node:crypto";
import type { Config } from "@stirilo/core";
import { defaultHasher, type PasswordHasher } from "./hasher.js";

// Compare two strings in constant time by comparing fixed-length digests.
function constantTimeEqual(a: string, b: string): boolean
{
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

// Verify a username/password against the configured single user. Always runs the
// password hash verification so failures do not leak which factor was wrong.
export async function verifyCredentials(
  config: Config,
  username: string,
  password: string,
  hasher: PasswordHasher = defaultHasher,
): Promise<boolean>
{
  const expectedUser = config.STIRILO_USERNAME ?? "";
  const expectedHash = config.STIRILO_PASSWORD_HASH ?? "";

  const userOk = constantTimeEqual(username, expectedUser);
  const passOk = expectedHash
    ? await hasher.verify(expectedHash, password)
    : false;

  return userOk && passOk;
}
