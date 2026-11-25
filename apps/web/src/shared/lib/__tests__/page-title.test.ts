import { describe, expect, it } from "vitest";
import { pageTitle } from "../page-title";

describe("pageTitle", () => {
  it("puts the page before the app name", () => {
    expect(pageTitle("Pretraga")).toBe("Pretraga · StoreSeeker");
  });

  it("is just the app name without a page", () => {
    expect(pageTitle()).toBe("StoreSeeker");
    expect(pageTitle("")).toBe("StoreSeeker");
  });
});
