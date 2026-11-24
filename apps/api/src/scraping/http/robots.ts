import robotsParser from "robots-parser";
import type { Clock } from "./clock";
import { BOT_TOKEN } from "./user-agent";

export type RobotsRules = { isAllowed(url: string): boolean };
export type RobotsResult = { rules: RobotsRules; ttlMs: number };

const ROBOTS_TTL_MS = 24 * 60 * 60 * 1000;
// RFC 9309: an unreachable robots.txt means "disallow all", but only until it is reachable again
const UNREACHABLE_TTL_MS = 10 * 60 * 1000;

const ALLOW_ALL: RobotsRules = { isAllowed: () => true };
const DENY_ALL: RobotsRules = { isAllowed: () => false };

/** `response` is null when robots.txt could not be fetched at all. */
export function robotsFromResponse(
  origin: string,
  response: { status: number; body: string } | null,
): RobotsResult {
  if (response === null || response.status === 429 || response.status >= 500) {
    return { rules: DENY_ALL, ttlMs: UNREACHABLE_TTL_MS };
  }
  if (response.status >= 400) return { rules: ALLOW_ALL, ttlMs: ROBOTS_TTL_MS };

  const robots = robotsParser(`${origin}/robots.txt`, response.body);
  return {
    // undefined means the URL is on another origin than this robots.txt: never allowed
    rules: { isAllowed: (url) => robots.isAllowed(url, BOT_TOKEN) === true },
    ttlMs: ROBOTS_TTL_MS,
  };
}

type Entry = { result: Promise<RobotsResult>; expiresAt: number };

export function createRobotsCache(clock: Clock, load: (origin: string) => Promise<RobotsResult>) {
  const entries = new Map<string, Entry>();

  return {
    async rulesFor(origin: string, signal?: AbortSignal): Promise<RobotsRules> {
      const cached = entries.get(origin);
      if (cached && clock.now() < cached.expiresAt) {
        return (await abortable(cached.result, signal)).rules;
      }

      // Concurrent callers share one fetch, so it runs without any one caller's signal
      // (its own 15 s timeout bounds it); each caller can still stop waiting for it
      const entry: Entry = { result: load(origin), expiresAt: Infinity };
      entries.set(origin, entry);
      entry.result.then(
        (result) => {
          entry.expiresAt = clock.now() + result.ttlMs;
        },
        () => {
          entries.delete(origin);
        },
      );
      return (await abortable(entry.result, signal)).rules;
    },
  };
}

function abortable<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const onAbort = () => reject(signal.reason);
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", onAbort));
  });
}
