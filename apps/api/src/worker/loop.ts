import { ScrapeJob, type ScrapeJobDocument } from "../db/models/scrape-job";
import type { Logger } from "../http/logger";
import { recordHeartbeat } from "./heartbeat";
import { claimNextJob, requeueJobs } from "./queue";
import { runCategoriesJob, type JobDeps } from "./run-categories-job";
import { enqueueScheduledIfDue } from "./schedule";

const DEFAULT_POLL_MS = 2_000;
const DEFAULT_HEARTBEAT_MS = 15_000;

export type WorkerDeps = JobDeps & { pollMs?: number; heartbeatMs?: number; logger?: Logger };

function isAbort(signal: AbortSignal, error: unknown): boolean {
  return signal.aborted && (error === signal.reason || (error as Error)?.name === "AbortError");
}

// Keeps the worker "online" while one long job runs; only the end of the job stops it
async function heartbeatsDuring(deps: WorkerDeps, signal: AbortSignal): Promise<void> {
  for (;;) {
    try {
      await deps.clock.sleep(deps.heartbeatMs ?? DEFAULT_HEARTBEAT_MS, signal);
    } catch {
      return;
    }
    try {
      await recordHeartbeat(new Date(deps.clock.now()));
    } catch (error) {
      deps.logger?.warn({ err: error }, "heartbeat failed");
    }
  }
}

async function runJob(job: ScrapeJobDocument, deps: WorkerDeps, signal: AbortSignal) {
  const beats = new AbortController();
  const heartbeat = heartbeatsDuring(deps, beats.signal);
  try {
    deps.logger?.info({ jobId: job.id, categories: job.categories }, "job started");
    await runCategoriesJob(job, deps, signal);
    deps.logger?.info({ jobId: job.id, status: job.status }, "job finished");
  } catch (error) {
    if (isAbort(signal, error) || signal.aborted) {
      // Stopped by hand: the next start crawls the job again from the beginning
      await requeueJobs({ _id: job._id });
      deps.logger?.info({ jobId: job.id }, "job put back in the queue");
      return;
    }
    deps.logger?.error({ err: error, jobId: job.id }, "job failed");
    await ScrapeJob.updateOne(
      { _id: job._id },
      { $set: { status: "failed", error: "worker error", finishedAt: new Date(deps.clock.now()) } },
    );
  } finally {
    beats.abort();
    await heartbeat;
  }
}

/** The worker's loop: heartbeat, schedule, then one job at a time from the queue. */
export function startWorker(deps: WorkerDeps): { stop(): Promise<void> } {
  const controller = new AbortController();
  const { signal } = controller;

  const loop = (async () => {
    while (!signal.aborted) {
      try {
        const now = new Date(deps.clock.now());
        await recordHeartbeat(now);
        await enqueueScheduledIfDue(now);
        const job = await claimNextJob(now);
        if (job) {
          await runJob(job, deps, signal);
          continue;
        }
      } catch (error) {
        // A database hiccup must not end the loop; the next turn tries again
        deps.logger?.error({ err: error }, "worker loop error");
      }
      await deps.clock.sleep(deps.pollMs ?? DEFAULT_POLL_MS, signal).catch(() => undefined);
    }
  })();

  return {
    async stop() {
      controller.abort(new Error("worker stopped"));
      await loop;
    },
  };
}
