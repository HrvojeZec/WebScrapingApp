import { Router } from "express";
import type { CrawlStatus, StoreDto, StoreSlug } from "@storeseeker/shared";
import { CrawlRun } from "../../db/models/crawl-run";
import { Store } from "../../db/models/store";

const USABLE_CRAWLS = ["ok", "partial"] as const;

const router = Router();

router.get("/stores", async (_req, res) => {
  const stores = await Store.find({ enabled: true }).sort({ name: 1 }).lean();
  const body: StoreDto[] = await Promise.all(
    stores.map(async (store) => {
      const [lastUsable, lastRun] = await Promise.all([
        CrawlRun.findOne(
          { storeSlug: store.slug, status: { $in: USABLE_CRAWLS } },
          { finishedAt: 1 },
        )
          .sort({ finishedAt: -1 })
          .lean(),
        CrawlRun.findOne({ storeSlug: store.slug }, { status: 1 }).sort({ finishedAt: -1 }).lean(),
      ]);
      return {
        slug: store.slug as StoreSlug,
        name: store.name,
        baseUrl: store.baseUrl,
        lastCrawledAt: lastUsable?.finishedAt.toISOString() ?? null,
        lastRunStatus: (lastRun?.status as CrawlStatus | undefined) ?? null,
      };
    }),
  );
  res.json(body);
});

export default router;
