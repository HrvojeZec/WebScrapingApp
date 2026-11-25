export type RateLimit = { max: number; windowMs: number };
export type ConsumeResult = { ok: true } | { ok: false; resetAt: Date };
export type RateLimiter = { consume(key: string, now: Date): ConsumeResult };

/**
 * A fixed window per key, kept in memory: the window starts with the first hit and a refused hit
 * does not extend it. Nothing is stored, so a restart forgets every count.
 */
export function createRateLimiter({ max, windowMs }: RateLimit): RateLimiter {
  const windows = new Map<string, { startedAt: number; hits: number }>();

  const forgetExpired = (now: number) => {
    for (const [key, window] of windows) {
      if (now - window.startedAt >= windowMs) windows.delete(key);
    }
  };

  return {
    consume(key, now) {
      const time = now.getTime();
      forgetExpired(time);
      const window = windows.get(key);
      if (!window) {
        windows.set(key, { startedAt: time, hits: 1 });
        return { ok: true };
      }
      if (window.hits >= max) return { ok: false, resetAt: new Date(window.startedAt + windowMs) };
      window.hits += 1;
      return { ok: true };
    },
  };
}
