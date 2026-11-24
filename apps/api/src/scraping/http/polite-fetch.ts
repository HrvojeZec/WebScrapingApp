import { LIMITS } from "@storeseeker/shared";
import { systemClock, type Clock } from "./clock";
import { createHostQueue } from "./host-queue";
import { createRobotsCache, robotsFromResponse } from "./robots";

export type FetchOutcome =
  | { kind: "ok"; status: 200; url: string; html: string }
  | {
      kind: "blocked";
      /** 0 when robots.txt blocked the URL and no request was made. */
      status: number;
      reason: "forbidden" | "rate_limited" | "challenge" | "robots";
      retryAfterMs?: number;
    }
  | { kind: "error"; status?: number; message: string };

export type PoliteFetch = {
  /** Rejects only when `signal` aborts; every other failure is a FetchOutcome. */
  get(url: string, signal?: AbortSignal): Promise<FetchOutcome>;
  /** For the browser fallback, so it waits in the same queue as plain requests. */
  waitTurn(origin: string, signal?: AbortSignal): Promise<void>;
};

export type PoliteFetchOptions = {
  userAgent: string;
  fetch?: typeof fetch;
  clock?: Clock;
  minIntervalMs?: number;
  timeoutMs?: number;
  maxRetries?: number;
  backoffBaseMs?: number;
  maxBodyBytes?: number;
};

const DEFAULT_RETRY_AFTER_MS = 60_000;
const MAX_RETRY_AFTER_MS = 3_600_000;

type Attempt =
  | { kind: "response"; status: number; headers: Headers; url: string; body: string | null }
  | { kind: "too_large"; status: number }
  | { kind: "timeout" }
  | { kind: "network"; message: string };

class TooLargeError extends Error {}
const TIMEOUT: unique symbol = Symbol("timeout");

export function createPoliteFetch({
  userAgent,
  fetch: fetchImpl = fetch,
  clock = systemClock,
  minIntervalMs = LIMITS.requestIntervalMs,
  timeoutMs = 15_000,
  maxRetries = 2,
  backoffBaseMs = 1_000,
  maxBodyBytes = 5 * 1024 * 1024,
}: PoliteFetchOptions): PoliteFetch {
  const queue = createHostQueue(clock, minIntervalMs);
  const headers = { "User-Agent": userAgent, "Accept-Language": "hr" };

  async function readBody(response: Response): Promise<string> {
    if (Number(response.headers.get("content-length")) > maxBodyBytes) throw new TooLargeError();
    if (!response.body) return "";
    // Counted while streaming, because a missing or false Content-Length must not let 1 GB in
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let size = 0;
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      size += value.byteLength;
      if (size > maxBodyBytes) {
        await reader.cancel();
        throw new TooLargeError();
      }
      text += decoder.decode(value, { stream: true });
    }
  }

  /** One request in the queue. The timeout uses the injected clock, so tests can drive it. */
  async function attempt(url: string, signal?: AbortSignal): Promise<Attempt> {
    await queue.waitTurn(new URL(url).origin, signal);
    // An abort between the queue and the listener below would otherwise go unnoticed
    signal?.throwIfAborted();

    const request = new AbortController();
    const stopTimer = new AbortController();
    const forwardAbort = () => request.abort(signal?.reason);
    signal?.addEventListener("abort", forwardAbort, { once: true });
    const timer: Promise<typeof TIMEOUT> = clock.sleep(timeoutMs, stopTimer.signal).then(
      () => TIMEOUT,
      () => TIMEOUT,
    );

    const work = (async (): Promise<Attempt> => {
      let response: Response | undefined;
      try {
        response = await fetchImpl(url, { headers, signal: request.signal, redirect: "follow" });
        // Bodies are only needed to spot challenge pages; others are dropped unread
        const needsBody = response.status === 200 || response.status >= 500;
        const body = needsBody ? await readBody(response) : null;
        if (!needsBody) await response.body?.cancel();
        return {
          kind: "response",
          status: response.status,
          headers: response.headers,
          url: response.url || url,
          body,
        };
      } catch (error) {
        if (signal?.aborted) throw signal.reason;
        if (error instanceof TooLargeError) return { kind: "too_large", status: response!.status };
        return { kind: "network", message: networkMessage(error) };
      }
    })();

    try {
      const winner = await Promise.race([work, timer]);
      if (winner === TIMEOUT) {
        if (signal?.aborted) throw signal.reason;
        request.abort();
        work.catch(() => {});
        return { kind: "timeout" };
      }
      return winner;
    } finally {
      stopTimer.abort();
      signal?.removeEventListener("abort", forwardAbort);
    }
  }

  const robots = createRobotsCache(clock, async (origin) => {
    // No retries: an unreachable robots.txt already means "try again in 10 minutes"
    const result = await attempt(`${origin}/robots.txt`);
    return robotsFromResponse(
      origin,
      result.kind === "response" ? { status: result.status, body: result.body ?? "" } : null,
    );
  });

  async function get(url: string, signal?: AbortSignal): Promise<FetchOutcome> {
    const origin = new URL(url).origin;
    const rules = await robots.rulesFor(origin, signal);
    if (!rules.isAllowed(url)) return { kind: "blocked", status: 0, reason: "robots" };

    for (let retry = 0; ; retry += 1) {
      const result = await attempt(url, signal);
      const canRetry = retry < maxRetries;

      // A hanging store is not retried: three 15 s waits would eat most of the job's 90 s
      if (result.kind === "timeout") return { kind: "error", message: "timeout" };
      if (result.kind === "network") {
        if (canRetry) {
          await clock.sleep(backoffBaseMs * 2 ** retry, signal);
          continue;
        }
        return { kind: "error", message: result.message };
      }
      if (result.kind === "too_large") {
        return { kind: "error", status: result.status, message: "response too large" };
      }

      const { status } = result;
      if (new URL(result.url).origin !== origin) {
        return { kind: "error", status, message: "redirected off-site" };
      }
      // Mall sends searches on to category pages, which robots.txt must allow as well
      if (result.url !== url && !rules.isAllowed(result.url)) {
        return { kind: "blocked", status: 0, reason: "robots" };
      }
      if (status === 429) {
        const retryAfterMs = parseRetryAfter(result.headers.get("retry-after"), clock.now());
        queue.pauseUntil(origin, clock.now() + retryAfterMs);
        return { kind: "blocked", status, reason: "rate_limited", retryAfterMs };
      }
      if (status === 403) {
        const challenge = result.headers.get("cf-mitigated") === "challenge";
        return { kind: "blocked", status, reason: challenge ? "challenge" : "forbidden" };
      }
      if ((status === 200 || status === 503) && isChallengePage(result.body ?? "")) {
        return { kind: "blocked", status, reason: "challenge" };
      }
      if (status === 200) return { kind: "ok", status, url: result.url, html: result.body ?? "" };
      if (status >= 500 && canRetry) {
        await clock.sleep(backoffBaseMs * 2 ** retry, signal);
        continue;
      }
      return { kind: "error", status, message: `HTTP ${status}` };
    }
  }

  return { get, waitTurn: (origin, signal) => queue.waitTurn(origin, signal) };
}

function isChallengePage(body: string): boolean {
  return body.includes("Just a moment") && body.includes("cf-chl");
}

function parseRetryAfter(header: string | null, nowMs: number): number {
  let ms = DEFAULT_RETRY_AFTER_MS;
  if (header && /^\d+$/.test(header.trim())) {
    ms = Number(header.trim()) * 1000;
  } else if (header && /[a-z]/i.test(header) && !Number.isNaN(Date.parse(header))) {
    // An HTTP date always names the weekday and month; Date.parse would also take "-5" as 2001
    ms = Date.parse(header) - nowMs;
  }
  return Math.min(Math.max(ms, 0), MAX_RETRY_AFTER_MS);
}

function networkMessage(error: unknown): string {
  if (!(error instanceof Error)) return String(error);
  const code = (error.cause as { code?: unknown } | undefined)?.code;
  return typeof code === "string" ? `${error.message} (${code})` : error.message;
}
