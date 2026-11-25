import {
  LIMITS,
  type CategorySlug,
  type CrawlStatus,
  type FetchMethod,
  type ShopSlug,
} from "@storeseeker/shared";
import { CrawlRun } from "../db/models/crawl-run";
import type { ScrapeJobDocument } from "../db/models/scrape-job";
import { Store } from "../db/models/store";
import { saveCategoryCrawl } from "../db/save-category-crawl";
import type { Clock } from "../scraping/http/clock";
import type { PageSource } from "../scraping/page-source";
import type { ShopAdapter } from "../scraping/shops/types";
import { crawlCategory, type CategoryCrawl } from "./crawl-category";
import { jobStatusFrom, storeStatusFrom } from "./job-status";

export type JobDeps = {
  sources: Partial<Record<FetchMethod, PageSource>>;
  adapters: Partial<Record<ShopSlug, ShopAdapter>>;
  clock: Clock;
  maxPages?: number;
  categoryTimeoutMs?: number;
};

const TIMED_OUT: CategoryCrawl = {
  status: "error",
  complete: false,
  pages: 0,
  products: [],
  error: "timeout",
};

// A category that takes too long ends as an error, so one stuck shop cannot hold the queue
async function crawlWithTimeout(
  deps: JobDeps,
  source: PageSource,
  adapter: ShopAdapter,
  category: CategorySlug,
  signal: AbortSignal,
): Promise<CategoryCrawl> {
  const controller = new AbortController();
  const stopWithJob = () => controller.abort(signal.reason);
  signal.addEventListener("abort", stopWithJob, { once: true });
  let timedOut = false;
  const timer = deps.clock
    .sleep(deps.categoryTimeoutMs ?? LIMITS.categoryCrawlTimeoutMs, controller.signal)
    .then(
      () => {
        timedOut = true;
        controller.abort(new Error("timeout"));
      },
      () => undefined,
    );
  try {
    return await crawlCategory(
      { source, maxPages: deps.maxPages ?? LIMITS.pagesPerCategory, signal: controller.signal },
      adapter,
      category,
    );
  } catch (error) {
    if (timedOut && !signal.aborted) return TIMED_OUT;
    throw error;
  } finally {
    signal.removeEventListener("abort", stopWithJob);
    controller.abort();
    await timer;
  }
}

/** Crawls the job's categories store by store and records the progress on the job. */
export async function runCategoriesJob(
  job: ScrapeJobDocument,
  deps: JobDeps,
  signal: AbortSignal,
): Promise<void> {
  const categories = job.categories as CategorySlug[];

  for (const part of job.perStore) {
    signal.throwIfAborted();
    const slug = part.storeSlug as ShopSlug;
    const store = await Store.findOne({ slug }, { enabled: 1 }).lean();
    const adapter = deps.adapters[slug];
    const source = adapter ? deps.sources[adapter.fetchMethod] : undefined;
    if (!store?.enabled || !adapter || !source) {
      part.status = "error";
      part.error = store?.enabled ? "no adapter for this shop" : "store disabled";
      await job.save();
      continue;
    }

    part.status = "running";
    await job.save();
    const runs: CrawlStatus[] = [];
    for (const category of categories) {
      if (!adapter.categories[category]) continue;
      const startedAt = new Date(deps.clock.now());
      const crawl = await crawlWithTimeout(deps, source, adapter, category, signal);
      const finishedAt = new Date(deps.clock.now());
      if (crawl.status === "ok" || crawl.status === "partial") {
        await saveCategoryCrawl({
          storeSlug: slug,
          category,
          products: crawl.products,
          seenAt: finishedAt,
          complete: crawl.complete,
        });
      }
      await CrawlRun.create({
        storeSlug: slug,
        category,
        jobId: job._id,
        status: crawl.status,
        pages: crawl.pages,
        products: crawl.products.length,
        error: crawl.error,
        startedAt,
        finishedAt,
      });

      runs.push(crawl.status);
      part.pages += crawl.pages;
      part.products += crawl.products.length;
      part.error ??= crawl.error;
      await job.save();
      if (crawl.status === "blocked") break;
    }

    part.status = storeStatusFrom(runs);
    if (runs.length === 0) part.error = "the shop has none of the job's categories";
    await job.save();
  }

  job.status = jobStatusFrom(job.perStore.map((part) => part.status));
  job.finishedAt = new Date(deps.clock.now());
  await job.save();
}
