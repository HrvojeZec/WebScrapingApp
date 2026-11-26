import { systemClock, type Clock } from "../http/clock";
import type { FetchOutcome, PoliteFetch } from "../http/polite-fetch";
import { isChallengePage, parseRetryAfter } from "../http/response-rules";
import type { PageSource } from "../page-source";
import type { BrowserHints } from "../shops/types";
import type { BrowserPort, MainResponse, PagePort } from "./ports";
import { shouldBlockRequest } from "./request-filter";

/** How long the number of cards must stay the same before the page is read. */
export const STABLE_CHECK_MS = 500;
const NAVIGATION_TIMEOUT_MS = 30_000;
const CONTENT_TIMEOUT_MS = 15_000;
// A page of a Chrome that hangs must not hold the worker forever
const PAGE_CLOSE_TIMEOUT_MS = 5_000;

export type BrowserSource = PageSource & {
  /** Closes the browser, if one was launched. */
  close(): Promise<void>;
};

export type BrowserSourceOptions = {
  /** The polite client, so the browser shares its robots.txt cache, queue and 429 pauses. */
  gate: Pick<PoliteFetch, "isAllowed" | "waitTurn" | "pause">;
  launch: () => Promise<BrowserPort>;
  userAgent: string;
  clock?: Clock;
  navigationTimeoutMs?: number;
  contentTimeoutMs?: number;
};

/**
 * Renders shop pages whose prices JavaScript fills in. Each page load counts as one request to
 * the shop: robots.txt first, then the shop's turn in the queue, and nothing is repeated.
 */
export function createBrowserSource({
  gate,
  launch,
  userAgent,
  clock = systemClock,
  navigationTimeoutMs = NAVIGATION_TIMEOUT_MS,
  contentTimeoutMs = CONTENT_TIMEOUT_MS,
}: BrowserSourceOptions): BrowserSource {
  let browser: Promise<BrowserPort> | null = null;

  /** The running browser; a new one when there is none yet or the last one crashed. */
  async function liveBrowser(): Promise<BrowserPort> {
    if (browser) {
      const current = await browser.catch(() => null);
      if (current?.connected()) return current;
      dropBrowser();
    }
    browser = launch();
    return browser;
  }

  function dropBrowser() {
    const old = browser;
    browser = null;
    void old?.then((port) => port.close()).catch(() => {});
  }

  async function closePage(page: PagePort) {
    const timer = new AbortController();
    await Promise.race([
      page.close().catch(() => {}),
      clock.sleep(PAGE_CLOSE_TIMEOUT_MS, timer.signal).catch(() => {}),
    ]);
    timer.abort();
  }

  /** Whether the number of cards stopped changing before the content timeout. */
  async function settled(page: PagePort, selector: string, signal?: AbortSignal) {
    const deadline = clock.now() + contentTimeoutMs;
    let previous = await untilAborted(page.count(selector), signal);
    while (clock.now() < deadline) {
      await clock.sleep(STABLE_CHECK_MS, signal);
      const current = await untilAborted(page.count(selector), signal);
      if (current > 0 && current === previous) return true;
      previous = current;
    }
    return false;
  }

  // The same checks in the same order as the HTTP client, after the browser's navigation
  async function read(
    page: PagePort,
    url: string,
    origin: string,
    hints: BrowserHints,
    signal?: AbortSignal,
  ): Promise<FetchOutcome> {
    const response: MainResponse | null = await untilAborted(
      page.goto(url, navigationTimeoutMs),
      signal,
    );
    if (!response) return { kind: "error", message: "no response" };

    const { status } = response;
    if (new URL(response.url).origin !== origin) {
      return { kind: "error", status, message: "redirected off-site" };
    }
    if (response.url !== url && !(await gate.isAllowed(response.url, signal))) {
      return { kind: "blocked", status: 0, reason: "robots" };
    }
    if (status === 429) {
      const retryAfterMs = parseRetryAfter(response.headers["retry-after"] ?? null, clock.now());
      gate.pause(origin, clock.now() + retryAfterMs);
      return { kind: "blocked", status, reason: "rate_limited", retryAfterMs };
    }
    if (status === 403) {
      const challenge = response.headers["cf-mitigated"] === "challenge";
      return { kind: "blocked", status, reason: challenge ? "challenge" : "forbidden" };
    }
    if (status === 503 && isChallengePage(await untilAborted(page.content(), signal))) {
      return { kind: "blocked", status, reason: "challenge" };
    }
    if (status !== 200) return { kind: "error", status, message: `HTTP ${status}` };

    const selector = hints.waitForSelector;
    if (!(await untilAborted(page.waitForSelector(selector, contentTimeoutMs), signal))) {
      // A challenge or a cookie wall can arrive with a 200 and stand where the list should be
      const html = await untilAborted(page.content(), signal);
      if (isChallengePage(html)) return { kind: "blocked", status, reason: "challenge" };
      return { kind: "error", status, message: "content did not appear" };
    }
    if (!(await settled(page, selector, signal))) {
      return { kind: "error", status, message: "content did not settle" };
    }
    const html = await untilAborted(page.content(), signal);
    return { kind: "ok", status, url: response.url, html };
  }

  async function get(
    url: string,
    signal?: AbortSignal,
    hints?: BrowserHints,
  ): Promise<FetchOutcome> {
    // A browser adapter always has hints; without them the page would be read before its prices
    if (!hints) return { kind: "error", message: "no browser hints for this page" };
    const origin = new URL(url).origin;
    if (!(await gate.isAllowed(url, signal))) {
      return { kind: "blocked", status: 0, reason: "robots" };
    }
    await gate.waitTurn(origin, signal);
    signal?.throwIfAborted();

    let page: PagePort;
    try {
      const current = await untilAborted(liveBrowser(), signal);
      page = await untilAborted(
        current.newPage({
          userAgent,
          blockRequest: (request) => shouldBlockRequest(request, origin, hints.extraHosts),
        }),
        signal,
      );
    } catch (error) {
      if (signal?.aborted) throw signal.reason;
      dropBrowser();
      return { kind: "error", message: `browser: ${errorMessage(error)}` };
    }

    try {
      return await read(page, url, origin, hints, signal);
    } catch (error) {
      if (signal?.aborted) throw signal.reason;
      if (error instanceof Error && error.name === "TimeoutError") {
        return { kind: "error", message: "timeout" };
      }
      return { kind: "error", message: errorMessage(error) };
    } finally {
      await closePage(page);
    }
  }

  async function close() {
    const current = browser;
    browser = null;
    const port = await current?.catch(() => null);
    await port?.close();
  }

  return { get, close };
}

/** The work, unless the signal aborts first; then its reason, and the work is left to finish. */
function untilAborted<T>(work: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return work;
  if (signal.aborted) {
    work.catch(() => {});
    return Promise.reject(signal.reason as Error);
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(signal.reason as Error);
    signal.addEventListener("abort", onAbort, { once: true });
    work.then(
      (value) => {
        signal.removeEventListener("abort", onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error as Error);
      },
    );
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
