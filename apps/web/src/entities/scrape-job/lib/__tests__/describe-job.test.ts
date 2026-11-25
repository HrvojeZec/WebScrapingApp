import type { StoreJobDto } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { describeStoreJob } from "../describe-job";

const job = (overrides: Partial<StoreJobDto>): StoreJobDto => ({
  storeSlug: "harveynorman",
  status: "pending",
  pages: 0,
  products: 0,
  error: null,
  ...overrides,
});

describe("describeStoreJob", () => {
  it("describes a store that waits or runs", () => {
    expect(describeStoreJob(job({ status: "pending" }))).toBe("čeka na red");
    expect(describeStoreJob(job({ status: "running" }))).toBe("osvježava se");
  });

  it("counts the products of a finished store in Croatian", () => {
    expect(describeStoreJob(job({ status: "ok", products: 42 }))).toBe("42 proizvoda");
    expect(describeStoreJob(job({ status: "ok", products: 1 }))).toBe("1 proizvod");
    expect(describeStoreJob(job({ status: "ok", products: 2 }))).toBe("2 proizvoda");
    expect(describeStoreJob(job({ status: "ok", products: 5 }))).toBe("5 proizvoda");
  });

  it("describes a store that did not finish", () => {
    expect(describeStoreJob(job({ status: "partial" }))).toBe("djelomično osvježeno");
    expect(describeStoreJob(job({ status: "blocked" }))).toBe("trgovina je odbila zahtjev");
    expect(describeStoreJob(job({ status: "error" }))).toBe("osvježavanje nije uspjelo");
  });

  it("never shows the internal error text", () => {
    const error = "TimeoutError: Navigation timeout of 30000 ms exceeded";
    for (const status of ["partial", "blocked", "error"] as const) {
      expect(describeStoreJob(job({ status, error }))).not.toContain("Timeout");
    }
  });
});
