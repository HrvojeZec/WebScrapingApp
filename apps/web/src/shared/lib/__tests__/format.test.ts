import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatDiscount, formatPrice } from "../format";

// Intl puts a no-break space before € and %, so a price never wraps away from its currency
const NBSP = " ";

describe("formatPrice", () => {
  it("formats cents as euros in the Croatian format", () => {
    expect(formatPrice(103999)).toBe(`1.039,99${NBSP}€`);
    expect(formatPrice(99900)).toBe(`999,00${NBSP}€`);
  });

  it("keeps the cents of a price under one euro", () => {
    expect(formatPrice(99)).toBe(`0,99${NBSP}€`);
  });
});

describe("formatDate", () => {
  it("formats a date in the Croatian format", () => {
    expect(formatDate("2026-11-24T10:42:00Z")).toBe("24. 11. 2026.");
  });

  it("uses the Zagreb day, not the UTC one", () => {
    expect(formatDate("2026-11-24T23:30:00Z")).toBe("25. 11. 2026.");
  });

  it("takes a Date as well", () => {
    expect(formatDate(new Date("2026-07-01T08:00:00Z"))).toBe("1. 7. 2026.");
  });
});

describe("formatDateTime", () => {
  it("joins the date and the Zagreb time with 'u'", () => {
    expect(formatDateTime("2026-11-24T10:42:00Z")).toBe("24. 11. 2026. u 11:42");
  });

  it("follows summer time", () => {
    expect(formatDateTime("2026-07-01T08:05:00Z")).toBe("1. 7. 2026. u 10:05");
  });
});

describe("formatDiscount", () => {
  it("shows a discount as a negative percentage with a real minus sign", () => {
    expect(formatDiscount(12)).toBe(`−12${NBSP}%`);
  });

  it("rounds to whole percent", () => {
    expect(formatDiscount(12.6)).toBe(`−13${NBSP}%`);
  });

  it("never shows a minus zero", () => {
    expect(formatDiscount(0)).toBe(`0${NBSP}%`);
    expect(formatDiscount(0.4)).toBe(`0${NBSP}%`);
  });
});
