import { JOB_STATUSES } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { isJobFinished } from "../job-status";

describe("isJobFinished", () => {
  it("is true for succeeded, partial and failed", () => {
    expect(JOB_STATUSES.filter(isJobFinished)).toEqual(["succeeded", "partial", "failed"]);
  });
});
