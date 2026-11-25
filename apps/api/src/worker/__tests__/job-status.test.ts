import { describe, expect, test } from "vitest";
import type { CrawlStatus, StoreJobStatus } from "@storeseeker/shared";
import { jobStatusFrom, storeStatusFrom } from "../job-status";

describe("storeStatusFrom", () => {
  test.each<[CrawlStatus[], CrawlStatus]>([
    [[], "error"],
    [["ok", "ok"], "ok"],
    [["ok", "error"], "partial"],
    [["partial", "blocked"], "partial"],
    [["error", "blocked"], "blocked"],
    [["blocked"], "blocked"],
    [["error", "error"], "error"],
  ])("%j gives %s", (runs, expected) => {
    expect(storeStatusFrom(runs)).toBe(expected);
  });
});

describe("jobStatusFrom", () => {
  test.each<[StoreJobStatus[], string]>([
    [["ok"], "succeeded"],
    [["ok", "ok"], "succeeded"],
    [["ok", "error"], "partial"],
    [["partial"], "partial"],
    [["blocked", "error"], "failed"],
    [["error"], "failed"],
    [[], "failed"],
  ])("%j gives %s", (perStore, expected) => {
    expect(jobStatusFrom(perStore)).toBe(expected);
  });
});
