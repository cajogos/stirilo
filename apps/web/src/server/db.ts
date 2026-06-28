import "server-only";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { loadConfig } from "@stirilo/core";
import { applyMigrations, createDatabase, type Db } from "@stirilo/db";

let db: Db | undefined;

// Lazily open the application database, ensuring its directory exists and
// migrations are applied. Reused as a singleton across requests.
export function getDb(): Db
{
  if (!db)
  {
    const config = loadConfig();
    const path = config.STIRILO_DB_PATH;
    if (path !== ":memory:")
    {
      mkdirSync(dirname(path), { recursive: true });
    }
    const handle = createDatabase(path);
    applyMigrations(handle.db);
    db = handle.db;
  }

  return db;
}
