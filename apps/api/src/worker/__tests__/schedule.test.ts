import { describe, expect, test } from "vitest";
import { CRAWL_HOURS, latestSlot } from "../schedule";

describe("latestSlot", () => {
  test.each([
    [new Date(2026, 10, 25, 6, 59), new Date(2026, 10, 24, 19, 0)],
    [new Date(2026, 10, 25, 7, 0), new Date(2026, 10, 25, 7, 0)],
    [new Date(2026, 10, 25, 23, 0), new Date(2026, 10, 25, 19, 0)],
    // The day clocks move forward: the slot is still 7:00 local time
    [new Date(2026, 2, 29, 8, 0), new Date(2026, 2, 29, 7, 0)],
  ])("%s gives %s", (now, expected) => {
    expect(latestSlot(now, CRAWL_HOURS)).toEqual(expected);
  });
});
