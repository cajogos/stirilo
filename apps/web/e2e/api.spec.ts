import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

const TOKEN = "e2e-agent-token-value";
const auth = { Authorization: `Bearer ${TOKEN}` };

test("rejects unauthenticated API requests", async ({ request }) =>
{
  const res = await request.get("/api/health");
  expect(res.status()).toBe(401);
  const body = await res.json();
  expect(body.error.code).toBe("UNAUTHORIZED");
});

test("rejects an invalid agent token", async ({ request }) =>
{
  const res = await request.get("/api/health", {
    headers: { Authorization: "Bearer wrong-token" },
  });
  expect(res.status()).toBe(401);
});

test("accepts a valid agent token and returns structured JSON", async ({
  request,
}) =>
{
  const res = await request.get("/api/health", { headers: auth });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.status).toBe("ok");
});

test("returns scan targets as structured JSON", async ({ request }) =>
{
  const res = await request.get("/api/scan-targets", { headers: auth });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(Array.isArray(body.scanTargets)).toBeTruthy();
});

test("does not expose secrets in the system summary", async ({ request }) =>
{
  const res = await request.get("/api/system/summary", { headers: auth });
  expect(res.ok()).toBeTruthy();
  const text = await res.text();
  expect(text).not.toContain("e2e-agent-token-value");
  expect(text).not.toContain("STIRILO_PASSWORD_HASH");
});

test("validates the create scan target body", async ({ request }) =>
{
  const res = await request.post("/api/scan-targets", {
    headers: auth,
    data: { name: "" },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error.code).toBe("VALIDATION_ERROR");
});

test("insights endpoints require the agent token", async ({ request }) =>
{
  const res = await request.get("/api/insights/sensitive");
  expect(res.status()).toBe(401);
});

test("sensitive inventory lists a fixture .env by metadata only", async ({
  request,
}) =>
{
  // A private temp fixture (unique path) so this never collides with the UI
  // scan test on the unique scan-target path. The server reads it off disk.
  const dir = mkdtempSync(join(tmpdir(), "stirilo-insights-"));
  writeFileSync(join(dir, "readme.txt"), "hello");
  // Detection is by filename (.env); the content is a plain, non-secret-shaped
  // sentinel we assert never appears in any API response.
  const sentinel = "do-not-ingest-this-fixture-line";
  writeFileSync(join(dir, ".env"), `${sentinel}\n`);

  const created = await request.post("/api/scan-targets", {
    headers: auth,
    data: { name: `Insights ${Date.now()}`, path: dir, confirm: true },
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();

  const scan = await request.post(`/api/scan-targets/${id}/scan`, {
    headers: auth,
  });
  expect(scan.ok()).toBeTruthy();

  const res = await request.get("/api/insights/sensitive", { headers: auth });
  expect(res.ok()).toBeTruthy();
  const text = await res.text();

  // The .env marker is detected (metadata), but its contents never leak.
  const body = JSON.parse(text) as {
    sensitive: { byRule: { rule: string }[] };
  };
  expect(body.sensitive.byRule.some((r) => r.rule === "env-file")).toBeTruthy();
  expect(text).not.toContain(sentinel);
  expect(text).not.toContain("e2e-agent-token-value");
});

test("at-risk report flags a repo with no remote", async ({ request }) =>
{
  const dir = mkdtempSync(join(tmpdir(), "stirilo-atrisk-"));
  const opts = { cwd: dir, stdio: "ignore" as const };
  execFileSync("git", ["init", "-q"], opts);
  execFileSync("git", ["config", "user.email", "t@example.com"], opts);
  execFileSync("git", ["config", "user.name", "Tester"], opts);
  execFileSync("git", ["config", "commit.gpgsign", "false"], opts);
  writeFileSync(join(dir, "a.txt"), "x");
  execFileSync("git", ["add", "."], opts);
  execFileSync("git", ["commit", "-q", "-m", "init"], opts);

  const created = await request.post("/api/scan-targets", {
    headers: auth,
    data: { name: `AtRisk ${Date.now()}`, path: dir, confirm: true },
  });
  expect(created.status()).toBe(201);
  const { id } = await created.json();
  await request.post(`/api/scan-targets/${id}/scan`, { headers: auth });

  const res = await request.get("/api/git/at-risk", { headers: auth });
  expect(res.ok()).toBeTruthy();
  const { atRisk } = await res.json();
  expect(atRisk.counts.noRemote).toBeGreaterThanOrEqual(1);
  expect(
    atRisk.noRemote.some((r: { path: string }) => r.path === dir),
  ).toBeTruthy();
});
