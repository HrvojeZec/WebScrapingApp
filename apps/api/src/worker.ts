import "dotenv/config";
import mongoose from "mongoose";
import { env } from "./config";
import { Meta } from "./db/models/meta";
import { ensureStores } from "./db/stores";
import { createLogger } from "./http/logger";
import { systemClock } from "./scraping/http/clock";
import { createBrowserSource } from "./scraping/browser/browser-source";
import { launchPuppeteer } from "./scraping/browser/puppeteer-port";
import { createPoliteFetch } from "./scraping/http/polite-fetch";
import { botUserAgent } from "./scraping/http/user-agent";
import { SHOP_ADAPTERS } from "./scraping/shops/registry";
import { startWorker } from "./worker/loop";
import { requeueRunningJobs } from "./worker/queue";

const logger = createLogger(env.LOG_LEVEL);

// The only process that requests shop pages; it runs on one home machine (design 4b)
async function main() {
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  logger.info({ db: mongoose.connection.name }, "database connected");

  if (await Meta.exists({ _id: "dataset", demo: true })) {
    logger.error("The worker does not write to the demo database.");
    await mongoose.disconnect();
    process.exitCode = 1;
    return;
  }

  await ensureStores();
  const requeued = await requeueRunningJobs();
  if (requeued > 0) logger.info({ requeued }, "jobs left running were put back in the queue");

  // One polite client: the browser waits in its queue and asks its robots.txt cache
  const userAgent = botUserAgent();
  const polite = createPoliteFetch({ userAgent });
  const browser = createBrowserSource({ gate: polite, launch: launchPuppeteer, userAgent });
  const worker = startWorker({
    sources: { http: polite, browser },
    adapters: SHOP_ADAPTERS,
    clock: systemClock,
    logger,
  });
  logger.info("worker started");

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info({ signal }, "stopping the worker");
    worker
      .stop()
      // A Chrome that will not close must not keep the database connection open
      .then(() =>
        browser.close().catch((error: unknown) => {
          logger.warn({ err: error }, "browser did not close cleanly");
        }),
      )
      .then(() => mongoose.disconnect())
      .catch((error: unknown) => {
        logger.error({ err: error }, "worker did not stop cleanly");
        process.exitCode = 1;
      });
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((error: unknown) => {
  logger.fatal({ err: error }, "worker failed to start");
  process.exitCode = 1;
  void mongoose.disconnect();
});
