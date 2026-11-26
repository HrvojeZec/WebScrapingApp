import type { PriceInsightDto } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { formatDate } from "@/shared/lib/format";
import { priceHistoryNote } from "../history-note";

// Intl puts a no-break space before €
const NBSP = " ";
const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date("2026-11-26T12:00:00Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * DAY_MS).toISOString();

const insight = (historySince: string): PriceInsightDto => ({
  lowest30dCents: 99900,
  historySince,
  inflatedDiscount: null,
});

describe("priceHistoryNote", () => {
  it("gives the start of a history shorter than 30 days", () => {
    const since = daysAgo(10);
    expect(priceHistoryNote(insight(since), now)).toEqual({
      kind: "historySince",
      text: `Povijest od ${formatDate(since)}`,
    });
  });

  it("writes the date as Croatian text", () => {
    expect(priceHistoryNote(insight("2026-11-01T09:00:00Z"), now).text).toBe(
      "Povijest od 1. 11. 2026.",
    );
  });

  it("gives the lowest price of 30 days once the history is long enough", () => {
    expect(priceHistoryNote(insight(daysAgo(60)), now)).toEqual({
      kind: "lowest30d",
      text: `Najniža u 30 dana: 999,00${NBSP}€`,
    });
  });

  it("counts exactly 30 days of history as long enough", () => {
    expect(priceHistoryNote(insight(daysAgo(30)), now).kind).toBe("lowest30d");
  });
});
