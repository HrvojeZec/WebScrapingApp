import { describe, expect, test } from "vitest";
import { fixtureName } from "../fixture-name";

describe("fixtureName", () => {
  test("uses the default name for a bare --save", () => {
    expect(fixtureName(true, "mobiteli-p1")).toBe("mobiteli-p1");
  });

  test("accepts a plain name", () => {
    expect(fixtureName("mobiteli-last", "mobiteli-p1")).toBe("mobiteli-last");
  });

  test.each(["../../x", "..\\..\\x", "a/b", "", ".hidden", "x.html"])(
    "rejects %j, so a fixture is never written outside __fixtures__",
    (name) => {
      expect(fixtureName(name, "mobiteli-p1")).toBeNull();
    },
  );
});
