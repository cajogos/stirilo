import { Algorithm, hash, verify } from "@node-rs/argon2";

// Abstraction so the hashing algorithm can change without touching call sites.
export interface PasswordHasher
{
  hash(password: string): Promise<string>;
  verify(storedHash: string, password: string): Promise<boolean>;
}

// argon2id is the current standard for password hashing. This supersedes the
// PRD's interim SHA-256.
export class Argon2idHasher implements PasswordHasher
{
  async hash(password: string): Promise<string>
  {
    return hash(password, { algorithm: Algorithm.Argon2id });
  }

  async verify(storedHash: string, password: string): Promise<boolean>
  {
    try
    {
      return await verify(storedHash, password);
    }
    catch
    {
      // A malformed stored hash should fail closed, not throw.
      return false;
    }
  }
}

export const defaultHasher: PasswordHasher = new Argon2idHasher();
