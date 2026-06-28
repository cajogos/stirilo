// Pure fixed-window rate-limit accounting. The caller owns the store (a Map in
// the server layer); this function just decides the next window state and
// whether the current hit is over the limit. Kept pure so it is easy to test.

export interface RateWindow
{
  count: number;
  windowStart: number;
}

export interface RateHit
{
  window: RateWindow;
  limited: boolean;
}

// Record a hit against a fixed window. A new window starts when none exists or
// the previous one has elapsed. `limited` is true once count exceeds `max`.
export function hitRateLimit(
  prev: RateWindow | undefined,
  now: number,
  max: number,
  windowMs: number,
): RateHit
{
  if (!prev || now - prev.windowStart >= windowMs)
  {
    return { window: { count: 1, windowStart: now }, limited: max < 1 };
  }
  const count = prev.count + 1;
  return {
    window: { count, windowStart: prev.windowStart },
    limited: count > max,
  };
}
