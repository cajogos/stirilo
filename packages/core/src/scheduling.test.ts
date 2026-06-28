import { describe, it, expect } from "vitest";
import { evaluateAlerts, isScheduleDue } from "./scheduling.js";

describe("isScheduleDue", () =>
{
  const now = Date.parse("2026-06-28T12:00:00.000Z");

  it("is always due when never run (and interval positive)", () =>
  {
    expect(isScheduleDue(null, 60, now)).toBe(true);
  });

  it("is not due before the interval elapses", () =>
  {
    const last = new Date(now - 30 * 60 * 1000).toISOString();
    expect(isScheduleDue(last, 60, now)).toBe(false);
  });

  it("is due once the interval has elapsed", () =>
  {
    const last = new Date(now - 61 * 60 * 1000).toISOString();
    expect(isScheduleDue(last, 60, now)).toBe(true);
  });

  it("is never due for a non-positive interval", () =>
  {
    expect(isScheduleDue(null, 0, now)).toBe(false);
  });
});

describe("evaluateAlerts", () =>
{
  const base = {
    diskPercent: 50,
    diskThresholdPercent: 90,
    addedSensitiveCount: 0,
    alertOnSensitive: true,
    dirtyRepoCount: 0,
    alertOnDirty: true,
  };

  it("fires nothing when all conditions are nominal", () =>
  {
    expect(evaluateAlerts(base)).toEqual([]);
  });

  it("fires a disk alert at or above threshold", () =>
  {
    const alerts = evaluateAlerts({ ...base, diskPercent: 92 });
    expect(alerts.map((a) => a.kind)).toContain("disk");
  });

  it("fires sensitive and dirty alerts when enabled and present", () =>
  {
    const alerts = evaluateAlerts({
      ...base,
      addedSensitiveCount: 2,
      dirtyRepoCount: 1,
    });
    expect(alerts.map((a) => a.kind).sort()).toEqual(["dirty", "sensitive"]);
  });

  it("respects the toggles", () =>
  {
    const alerts = evaluateAlerts({
      ...base,
      addedSensitiveCount: 2,
      dirtyRepoCount: 1,
      alertOnSensitive: false,
      alertOnDirty: false,
    });
    expect(alerts).toEqual([]);
  });

  it("does not fire disk when threshold is 0 (disabled)", () =>
  {
    const alerts = evaluateAlerts({
      ...base,
      diskPercent: 99,
      diskThresholdPercent: 0,
    });
    expect(alerts).toEqual([]);
  });
});
