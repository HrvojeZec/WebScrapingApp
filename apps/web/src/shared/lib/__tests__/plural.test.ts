import { describe, expect, it } from "vitest";
import { countText, pluralHr, PRODUCT_FORMS } from "../plural";

const FORMS = { one: "one", few: "few", other: "other" };

describe("pluralHr", () => {
  it("takes the singular for 1 and 21", () => {
    expect(pluralHr(1, FORMS)).toBe("one");
    expect(pluralHr(21, FORMS)).toBe("one");
  });

  it("takes the few form for 2 to 4 and 22", () => {
    for (const count of [2, 3, 4, 22]) expect(pluralHr(count, FORMS)).toBe("few");
  });

  it("takes the other form for 0, 5 and the teens", () => {
    for (const count of [0, 5, 11, 12, 14]) expect(pluralHr(count, FORMS)).toBe("other");
  });
});

describe("countText", () => {
  it("writes the count in the Croatian format with the right form", () => {
    expect(countText(1, PRODUCT_FORMS)).toBe("1 proizvod");
    expect(countText(2, PRODUCT_FORMS)).toBe("2 proizvoda");
    expect(countText(5, PRODUCT_FORMS)).toBe("5 proizvoda");
    expect(countText(1021, PRODUCT_FORMS)).toBe("1.021 proizvod");
  });
});
