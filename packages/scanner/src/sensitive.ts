import { extname } from "node:path";

// Detect sensitive files by NAME only. The scanner never opens these files; it
// only records that they exist. Returns a short detection-rule label, or null.
export function detectSensitiveFile(name: string): string | null
{
  if (name === ".env" || name.startsWith(".env."))
  {
    return "env-file";
  }
  if (name === "id_rsa" || name === "id_ed25519")
  {
    return "ssh-private-key";
  }

  const ext = extname(name).toLowerCase();
  switch (ext)
  {
    case ".pem":
    case ".key":
    case ".p12":
    case ".pfx":
      return "key-or-certificate";
    case ".kdbx":
      return "password-database";
    case ".sqlite":
    case ".sqlite3":
    case ".db":
      return "database-file";
    default:
      return null;
  }
}
