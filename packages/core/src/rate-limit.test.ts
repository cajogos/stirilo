import { describe, it, expect } from "vitest";
import { hitRateLimit, type RateWindow } from "./rate-limit.js";

describe("hitRateLimit", () =>
{
  const windowMs = 60_000;

  it("starts a fresh window on the first hit", () =>
  {
    const r = hitRateLimit(undefined, 1000, 5, windowMs);
    expect(r.window.count).toBe(1);
    expect(r.limited).toBe(false);
  });

  it("counts within a window and limits once over max", () =>
  {
    let w: RateWindow | undefined;
    let limited = false;
    for (let i = 0; i < 6; i += 1)
    {
      const r = hitRateLimit(w, 1000 + i, 5, windowMs);
      w = r.window;
      limited = r.limited;
    }
    // 6th hit exceeds max of 5.
    expect(w?.count).toBe(6);
    expect(limited).toBe(true);
  });

  it("resets after the window elapses", () =>
  {
    const first = hitRateLimit(undefined, 0, 1, windowMs);
    const second = hitRateLimit(first.window, windowMs + 1, 1, windowMs);
    expect(second.window.count).toBe(1);
    expect(second.limited).toBe(false);
  });
});
