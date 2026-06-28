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
