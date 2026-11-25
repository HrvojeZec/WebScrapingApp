import { Router, type Request } from "express";
import { z } from "zod";
import {
  CATEGORY_SLUGS,
  createScrapeBodySchema,
  objectIdSchema,
  type CreateScrapeBody,
  type CreateScrapeResponse,
} from "@storeseeker/shared";
import { ScrapeJob } from "../../db/models/scrape-job";
import { AppError, notFound } from "../../http/errors";
import type { RateLimiter } from "../../http/rate-limit";
import { validate } from "../../http/validate";
import { enqueueCategoriesJob, findActiveJobCovering } from "../../worker/queue";
import { describeJob, enabledShopSlugs, freshSince } from "./scrapes.service";

export type ScrapesDeps = { now: () => Date; refreshLimiter: RateLimiter };

const resetTime = new Intl.DateTimeFormat("hr-HR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Zagreb",
});

const noShops = () => new AppError(409, "no_shops", "Nijedna trgovina trenutno nije uključena.");

// The client address is the only key there is: nothing about the user is stored
const clientKey = (req: Request) => req.ip ?? req.socket.remoteAddress ?? "unknown";

export function createScrapesRouter({ now, refreshLimiter }: ScrapesDeps): Router {
  const router = Router();
  // One request at a time: looking for an active job and queueing a new one are two steps, and
  // two clicks in parallel must not queue two jobs. The API is a single process.
  let previous: Promise<unknown> = Promise.resolve();
  const oneAtATime = <T>(work: () => Promise<T>): Promise<T> => {
    const result = previous.then(work, work);
    previous = result.catch(() => undefined);
    return result;
  };

  router.post("/scrapes", validate({ body: createScrapeBodySchema }), async (req, res) => {
    const body = res.locals.body as CreateScrapeBody;
    const categories = body?.categories ?? [...CATEGORY_SLUGS];

    const { status, payload } = await oneAtATime(async () => {
      const time = now();
      const active = await findActiveJobCovering(categories);
      if (active) return reply(202, { fresh: false, job: await describeJob(active, time) });

      const shops = await enabledShopSlugs();
      // Before the limit: a click that cannot queue anything must not use up a refresh
      if (shops.length === 0) throw noShops();
      const lastCrawledAt = await freshSince(shops, categories, time);
      if (lastCrawledAt)
        return reply(200, { fresh: true, lastCrawledAt: lastCrawledAt.toISOString() });

      const verdict = refreshLimiter.consume(clientKey(req), time);
      if (!verdict.ok) {
        throw new AppError(
          429,
          "rate_limited",
          `Cijene si nedavno osvježio. Pokušaj ponovo nakon ${resetTime.format(verdict.resetAt)}.`,
          { resetAt: verdict.resetAt.toISOString() },
        );
      }
      const job = await enqueueCategoriesJob({ source: "request", categories, now: time });
      if (!job) throw noShops();
      return reply(202, { fresh: false, job: await describeJob(job, time) });
    });
    res.status(status).json(payload);
  });

  router.get(
    "/scrapes/:id",
    validate({ params: z.object({ id: objectIdSchema }) }),
    async (_req, res) => {
      const { id } = res.locals.params as { id: string };
      const job = await ScrapeJob.findById(id);
      if (!job) throw notFound("Ovaj posao ne postoji ili je istekao.");
      res.json(await describeJob(job, now()));
    },
  );

  return router;
}

function reply(status: 200 | 202, payload: CreateScrapeResponse) {
  return { status, payload };
}
