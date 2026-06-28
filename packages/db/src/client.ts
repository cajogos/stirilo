import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

export type Db = BetterSQLite3Database<typeof schema>;

export interface DatabaseHandle
{
  db: Db;
  sqlite: Database.Database;
}

// Open a SQLite database at the given path (or ":memory:") and wrap it with
// Drizzle. better-sqlite3 is intentionally confined to this package.
export function createDatabase(path: string): DatabaseHandle
{
  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}

const MIGRATIONS_FOLDER = fileURLToPath(new URL("../drizzle", import.meta.url));

export function applyMigrations(db: Db): void
{
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}

// Convenience for tests: an in-memory database with migrations already applied.
export function createInMemoryDatabase(): DatabaseHandle
{
  const handle = createDatabase(":memory:");
  applyMigrations(handle.db);
  return handle;
}
