import { describe, it, expect } from "vitest";
import { eq } from "drizzle-orm";
import { createInMemoryDatabase } from "./client.js";
import { settings } from "./schema.js";

describe("database", () =>
{
  it("applies migrations and round-trips a setting", () =>
  {
    const { db } = createInMemoryDatabase();

    db.insert(settings).values({ key: "theme", value: "dark" }).run();
    const rows = db
      .select()
      .from(settings)
      .where(eq(settings.key, "theme"))
      .all();

    expect(rows).toHaveLength(1);
    expect(rows[0]?.value).toBe("dark");
  });

  it("enforces the primary key", () =>
  {
    const { db } = createInMemoryDatabase();
    db.insert(settings).values({ key: "k", value: "1" }).run();

    expect(() =>
      db.insert(settings).values({ key: "k", value: "2" }).run(),
    ).toThrow();
  });
});
