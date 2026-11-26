import { describe, expect, test } from "vitest";
import { harveyNormanAdapter } from "../adapter";

describe("harveyNormanAdapter.pageUrl", () => {
  test("adds the page as ?p=N, the only page parameter robots.txt allows", () => {
    expect(harveyNormanAdapter.pageUrl("https://www.harveynorman.hr/mobiteli/slusalice", 3)).toBe(
      "https://www.harveynorman.hr/mobiteli/slusalice?p=3",
    );
  });
});
