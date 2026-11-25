import { describe, expect, test } from "vitest";
import { createRandom } from "../random";

function take(next: () => number, count: number): number[] {
  return Array.from({ length: count }, next);
}

describe("createRandom", () => {
  test("the same seed gives the same sequence", () => {
    expect(take(createRandom(42), 20)).toEqual(take(createRandom(42), 20));
  });

  test("another seed gives another sequence", () => {
    expect(take(createRandom(42), 20)).not.toEqual(take(createRandom(43), 20));
  });

  test("returns numbers in [0, 1)", () => {
    for (const value of take(createRandom(20261125), 1_000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
