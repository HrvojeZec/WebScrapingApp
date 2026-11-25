import { describe, expect, test } from "vitest";
import { createRateLimiter } from "../rate-limit";

const HOUR_MS = 60 * 60 * 1000;
const START = new Date("2026-11-25T10:00:00Z");
const at = (ms: number) => new Date(START.getTime() + ms);

describe("createRateLimiter", () => {
  test("allows max hits in a window, then refuses until the window of the first hit ends", () => {
    const limiter = createRateLimiter({ max: 3, windowMs: HOUR_MS });
    expect(limiter.consume("1.2.3.4", START)).toEqual({ ok: true });
    expect(limiter.consume("1.2.3.4", at(10_000))).toEqual({ ok: true });
    expect(limiter.consume("1.2.3.4", at(20_000))).toEqual({ ok: true });
    expect(limiter.consume("1.2.3.4", at(30_000))).toEqual({ ok: false, resetAt: at(HOUR_MS) });
  });

  test("allows hits again once the window has passed", () => {
    const limiter = createRateLimiter({ max: 3, windowMs: HOUR_MS });
    for (let i = 0; i < 3; i++) limiter.consume("1.2.3.4", at(i));
    expect(limiter.consume("1.2.3.4", at(HOUR_MS - 1)).ok).toBe(false);
    expect(limiter.consume("1.2.3.4", at(HOUR_MS))).toEqual({ ok: true });
    expect(limiter.consume("1.2.3.4", at(HOUR_MS + 1))).toEqual({ ok: true });
  });

  test("a refused hit does not extend the window", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: HOUR_MS });
    limiter.consume("1.2.3.4", START);
    limiter.consume("1.2.3.4", at(HOUR_MS / 2));
    expect(limiter.consume("1.2.3.4", at(HOUR_MS))).toEqual({ ok: true });
  });

  test("different keys are counted apart", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: HOUR_MS });
    expect(limiter.consume("1.2.3.4", START)).toEqual({ ok: true });
    expect(limiter.consume("5.6.7.8", START)).toEqual({ ok: true });
    expect(limiter.consume("1.2.3.4", START).ok).toBe(false);
    expect(limiter.consume("5.6.7.8", START).ok).toBe(false);
  });
});
