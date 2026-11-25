import type { ScrapeJobDto, StoreDto, StoreJobDto } from "@storeseeker/shared";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api/base-api";
import {
  describeFresh,
  describeRefresh,
  describeRefreshError,
  refreshStoreLines,
} from "../describe-refresh";

const job = (overrides: Partial<ScrapeJobDto>): ScrapeJobDto => ({
  id: "6744a1f0c2b9e1a2b3c4d5e6",
  kind: "categories",
  source: "request",
  status: "queued",
  categories: ["slusalice"],
  perStore: [],
  createdAt: "2026-11-25T16:00:00Z",
  startedAt: null,
  finishedAt: null,
  queuePosition: 0,
  workerOnline: true,
  ...overrides,
});

describe("describeRefresh", () => {
  it("says how many jobs are ahead in the queue", () => {
    expect(describeRefresh(job({ queuePosition: 2 }))).toBe(
      "U redu čekanja, ispred je još 2 posla.",
    );
    expect(describeRefresh(job({ queuePosition: 1 }))).toBe(
      "U redu čekanja, ispred je još 1 posao.",
    );
  });

  it("keeps the saved prices while the worker is not running", () => {
    expect(describeRefresh(job({ workerOnline: false, queuePosition: 2 }))).toBe(
      "Osvježavanje je u redu čekanja i krenut će kad se radnik pokrene. Prikazujem spremljene cijene.",
    );
  });

  it("describes a job that is next or running", () => {
    expect(describeRefresh(job({ queuePosition: 0 }))).toBe("Osvježavanje kreće za koji trenutak.");
    expect(describeRefresh(job({ status: "running", queuePosition: null }))).toBe(
      "Osvježavam cijene. Dok ne završi, prikazujem spremljene.",
    );
  });

  it("describes a finished job", () => {
    expect(describeRefresh(job({ status: "succeeded" }))).toBe("Cijene su osvježene.");
    expect(describeRefresh(job({ status: "partial" }))).toBe(
      "Dio trgovina nije osvježen. Za njih prikazujem spremljene cijene.",
    );
    expect(describeRefresh(job({ status: "failed" }))).toBe(
      "Osvježavanje nije uspjelo. Prikazujem spremljene cijene.",
    );
  });
});

describe("describeRefreshError", () => {
  it("says when to try again after too many refreshes, in Zagreb time", () => {
    const error = new ApiError("rate_limited", "x", 429, "2026-11-25T16:40:00Z");
    expect(describeRefreshError(error)).toBe("Previše osvježavanja. Pokušaj ponovo nakon 17:40.");
  });

  it("asks to try later when the limit has no reset time", () => {
    const error = new ApiError("rate_limited", "x", 429);
    expect(describeRefreshError(error)).toBe("Previše osvježavanja. Pokušaj ponovo kasnije.");
  });

  it("shows the server-down sentence when the API does not answer", () => {
    const error = new ApiError("unavailable", "Expected JSON", 502);
    expect(describeRefreshError(error)).toContain("Poslužitelj trenutno ne odgovara");
  });

  it("shows the API's own sentence for its other codes", () => {
    const error = new ApiError("no_shops", "Nijedna trgovina trenutno nije uključena.", 409);
    expect(describeRefreshError(error)).toBe("Nijedna trgovina trenutno nije uključena.");
  });
});

describe("describeFresh", () => {
  it("says the prices are fresh and when they were crawled, in Zagreb time", () => {
    expect(describeFresh("2026-11-25T15:05:00Z")).toBe(
      "Cijene su svježe, zadnje osvježavanje 25. 11. 2026. u 16:05.",
    );
  });
});

describe("refreshStoreLines", () => {
  const stores: StoreDto[] = [
    {
      slug: "harveynorman",
      name: "Harvey Norman",
      baseUrl: "https://www.harveynorman.hr",
      lastCrawledAt: null,
      lastRunStatus: null,
    },
  ];

  it("names each store of the job and says how it went", () => {
    const perStore: StoreJobDto[] = [
      { storeSlug: "harveynorman", status: "ok", pages: 3, products: 21, error: null },
      { storeSlug: "demo-a", status: "running", pages: 0, products: 0, error: null },
    ];
    expect(refreshStoreLines(perStore, stores)).toEqual([
      { storeSlug: "harveynorman", name: "Harvey Norman", text: "21 proizvod" },
      { storeSlug: "demo-a", name: "demo-a", text: "osvježava se" },
    ]);
  });
});
