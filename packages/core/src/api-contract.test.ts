import { describe, it, expect } from "vitest";
import {
  API_ROUTES,
  buildOpenApiDocument,
  createScanTargetBodySchema,
  idParamSchema,
} from "./api-contract.js";

describe("createScanTargetBodySchema", () =>
{
  it("accepts a valid body and rejects missing fields", () =>
  {
    expect(
      createScanTargetBodySchema.safeParse({ name: "x", path: "/tmp" }).success,
    ).toBe(true);
    expect(createScanTargetBodySchema.safeParse({ name: "x" }).success).toBe(
      false,
    );
    expect(
      createScanTargetBodySchema.safeParse({ name: "", path: "/tmp" }).success,
    ).toBe(false);
  });
});

describe("idParamSchema", () =>
{
  it("requires a non-empty id", () =>
  {
    expect(idParamSchema.safeParse({ id: "abc" }).success).toBe(true);
    expect(idParamSchema.safeParse({ id: "" }).success).toBe(false);
  });
});

describe("buildOpenApiDocument", () =>
{
  it("documents every registered route under bearer auth", () =>
  {
    const doc = buildOpenApiDocument();
    for (const route of API_ROUTES)
    {
      const path = doc.paths?.[route.path];
      expect(path, `missing path ${route.path}`).toBeDefined();
      expect(path?.[route.method]).toBeDefined();
    }
    expect(doc.components?.securitySchemes?.agentToken).toBeDefined();
  });
});
