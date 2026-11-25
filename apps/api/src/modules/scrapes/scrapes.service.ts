import { LIMITS, SHOP_SLUGS, type CategorySlug, type ShopSlug } from "@storeseeker/shared";
import { CrawlRun } from "../../db/models/crawl-run";
import type { ScrapeJobDocument } from "../../db/models/scrape-job";
import { Store } from "../../db/models/store";
import { SHOP_ADAPTERS } from "../../scraping/shops/registry";
import { workerStatus } from "../../worker/heartbeat";
import { queuePosition } from "../../worker/queue";
import { toScrapeJobDto } from "./to-dto";

const USABLE_CRAWLS = ["ok", "partial"] as const;

export async function enabledShopSlugs(): Promise<ShopSlug[]> {
  const stores = await Store.find({ enabled: true, slug: { $in: SHOP_SLUGS } }, { slug: 1 }).lean();
  return stores.map((store) => store.slug as ShopSlug);
}

/**
 * When every asked category of every enabled shop had a usable crawl within
 * LIMITS.refreshCooldownMs: the oldest of those crawls. Otherwise null.
 */
export async function freshSince(
  shops: ShopSlug[],
  categories: CategorySlug[],
  now: Date,
): Promise<Date | null> {
  const pairs = shops.flatMap((shop) =>
    categories
      .filter((category) => SHOP_ADAPTERS[shop].categories[category])
      .map((category) => ({ shop, category })),
  );
  if (pairs.length === 0) return null;
  const since = new Date(now.getTime() - LIMITS.refreshCooldownMs);
  const latest = await Promise.all(
    pairs.map(({ shop, category }) =>
      CrawlRun.findOne(
        {
          storeSlug: shop,
          category,
          status: { $in: USABLE_CRAWLS },
          finishedAt: { $gte: since },
        },
        { finishedAt: 1 },
      )
        .sort({ finishedAt: -1 })
        .lean(),
    ),
  );
  let oldest: Date | null = null;
  for (const run of latest) {
    if (!run) return null;
    if (!oldest || run.finishedAt < oldest) oldest = run.finishedAt;
  }
  return oldest;
}

export async function describeJob(job: ScrapeJobDocument, now: Date) {
  const [position, worker] = await Promise.all([queuePosition(job), workerStatus(now)]);
  return toScrapeJobDto(job, { queuePosition: position, workerOnline: worker.online });
}
