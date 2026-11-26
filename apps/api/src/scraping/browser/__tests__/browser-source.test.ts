import { describe, expect, test } from "vitest";
import { createFakeClock } from "../../http/__tests__/fakes";
import { STABLE_CHECK_MS, createBrowserSource } from "../browser-source";
import { shouldBlockRequest } from "../request-filter";
import {
  createFakeGate,
  createFakeLauncher,
  timeoutError,
  type Event,
  type FakePage,
} from "./fakes";

const ORIGIN = "https://www.shop.example";
const LISTING = `${ORIGIN}/televizori`;
const UA = "StoreSeekerBot/0.3.0 (+https://github.com/HrvojeZec/WebScrapingApp)";
const HINTS = { waitForSelector: ".product-card", extraHosts: ["api.shop.example"] };
const CONTENT_TIMEOUT_MS = 15_000;
const CHALLENGE_BODY =
  '<html><head><title>Just a moment...</title></head><body><form id="cf-chl-form"></form></body></html>';

function setup(
  pages: FakePage[],
  { allowed, crashOnNewPage }: { allowed?: (url: string) => boolean; crashOnNewPage?: number } = {},
) {
  const fake = createFakeClock();
  const events: Event[] = [];
  const { gate, pauses } = createFakeGate(fake.clock, events, allowed);
  const launcher = createFakeLauncher(fake.clock, events, pages, { crashOnNewPage });
  const source = createBrowserSource({
    gate,
    launch: launcher.launch,
    userAgent: UA,
    clock: fake.clock,
    contentTimeoutMs: CONTENT_TIMEOUT_MS,
  });
  const get = (url = LISTING, signal?: AbortSignal) => fake.run(source.get(url, signal, HINTS));
  const calls = () => events.map((event) => event.call);
  return { ...fake, ...launcher, events, pauses, source, get, calls };
}

describe("createBrowserSource", () => {
  test("returns the rendered HTML", async () => {
    const { get, pagesClosed } = setup([{ html: "<main><div class=product-card></div></main>" }]);

    expect(await get()).toEqual({
      kind: "ok",
      status: 200,
      url: LISTING,
      html: "<main><div class=product-card></div></main>",
    });
    expect(pagesClosed).toEqual([true]);
  });

  test("returns the URL the page ended on", async () => {
    const { get } = setup([{ response: { url: `${ORIGIN}/televizori/` } }]);

    expect(await get()).toMatchObject({ kind: "ok", url: `${ORIGIN}/televizori/` });
  });

  test("asks robots.txt before opening a page", async () => {
    const { get, calls } = setup([{}], { allowed: () => false });

    expect(await get()).toEqual({ kind: "blocked", status: 0, reason: "robots" });
    expect(calls()).not.toContain("launch");
    expect(calls()).not.toContain("newPage");
  });

  test("waits its turn", async () => {
    const { get, calls } = setup([{}]);

    await get();

    const order = calls().filter((call) =>
      ["isAllowed", "waitTurn", "newPage", "goto"].includes(call),
    );
    expect(order).toEqual(["isAllowed", "waitTurn", "newPage", "goto"]);
  });

  test("sets the bot User-Agent and the request filter", async () => {
    const { get, setups } = setup([{}]);

    await get();

    expect(setups).toHaveLength(1);
    expect(setups[0].userAgent).toBe(UA);
    const requests = [
      { url: `${ORIGIN}/a.png`, resourceType: "image" },
      { url: `${ORIGIN}/app.js`, resourceType: "script" },
      { url: "https://api.shop.example/prices", resourceType: "fetch" },
      { url: "https://www.googletagmanager.com/gtm.js", resourceType: "script" },
    ];
    for (const request of requests) {
      expect(setups[0].blockRequest(request)).toBe(
        shouldBlockRequest(request, ORIGIN, HINTS.extraHosts),
      );
    }
  });

  test("a 429 pauses the shop for its Retry-After", async () => {
    const { get, pauses, clock, pagesClosed } = setup([
      { response: { status: 429, headers: { "retry-after": "120" } } },
    ]);
    const start = clock.now();

    expect(await get()).toEqual({
      kind: "blocked",
      status: 429,
      reason: "rate_limited",
      retryAfterMs: 120_000,
    });
    expect(pauses).toEqual([{ origin: ORIGIN, untilMs: start + 120_000 }]);
    expect(pagesClosed).toEqual([true]);
  });

  test("a 403 with cf-mitigated: challenge is a challenge, without it forbidden", async () => {
    const challenge = setup([
      { response: { status: 403, headers: { "cf-mitigated": "challenge" } } },
    ]);
    expect(await challenge.get()).toEqual({ kind: "blocked", status: 403, reason: "challenge" });

    const forbidden = setup([{ response: { status: 403 } }]);
    expect(await forbidden.get()).toEqual({ kind: "blocked", status: 403, reason: "forbidden" });
  });

  test("a 503 challenge page is a challenge", async () => {
    const { get } = setup([{ response: { status: 503 }, html: CHALLENGE_BODY }]);

    expect(await get()).toEqual({ kind: "blocked", status: 503, reason: "challenge" });
  });

  test("a 500 is an error and is not repeated", async () => {
    const { get, calls } = setup([{ response: { status: 500 } }]);

    expect(await get()).toEqual({ kind: "error", status: 500, message: "HTTP 500" });
    expect(calls().filter((call) => call === "goto")).toHaveLength(1);
  });

  test("waits until the list stops re-rendering", async () => {
    const { get, events, clock } = setup([{ counts: [36, 0, 36, 36] }]);
    const start = clock.now();

    expect(await get()).toMatchObject({ kind: "ok" });

    const counts = events.filter((event) => event.call === "count");
    expect(counts.map((event) => event.at - start)).toEqual([
      0,
      STABLE_CHECK_MS,
      2 * STABLE_CHECK_MS,
      3 * STABLE_CHECK_MS,
    ]);
    expect(counts.every((event) => event.arg === HINTS.waitForSelector)).toBe(true);
    const content = events.find((event) => event.call === "content");
    expect(content?.at).toBe(start + 3 * STABLE_CHECK_MS);
  });

  test("a list that never settles is an error", async () => {
    const counts = Array.from({ length: 100 }, (_, index) => index + 1);
    const { get, calls, pagesClosed, clock } = setup([{ counts }]);
    const start = clock.now();

    expect(await get()).toEqual({ kind: "error", status: 200, message: "content did not settle" });
    expect(calls()).not.toContain("content");
    expect(clock.now() - start).toBeLessThanOrEqual(CONTENT_TIMEOUT_MS + STABLE_CHECK_MS);
    expect(pagesClosed).toEqual([true]);
  });

  test("content that never appears is an error", async () => {
    const { get, pagesClosed } = setup([
      { selectorAppears: false, html: "<main>new layout</main>" },
    ]);

    expect(await get()).toEqual({ kind: "error", status: 200, message: "content did not appear" });
    expect(pagesClosed).toEqual([true]);
  });

  test("a challenge page instead of the content is a challenge", async () => {
    const { get, pagesClosed } = setup([{ selectorAppears: false, html: CHALLENGE_BODY }]);

    expect(await get()).toEqual({ kind: "blocked", status: 200, reason: "challenge" });
    expect(pagesClosed).toEqual([true]);
  });

  test("a navigation timeout is an error", async () => {
    const { get, pagesClosed } = setup([{ response: timeoutError() }]);

    expect(await get()).toEqual({ kind: "error", message: "timeout" });
    expect(pagesClosed).toEqual([true]);
  });

  test("a network error is an error with its message", async () => {
    const { get } = setup([{ response: new Error("net::ERR_CONNECTION_REFUSED") }]);

    expect(await get()).toEqual({ kind: "error", message: "net::ERR_CONNECTION_REFUSED" });
  });

  test("a navigation without a response is an error", async () => {
    const { get } = setup([{ response: null }]);

    expect(await get()).toEqual({ kind: "error", message: "no response" });
  });

  test("a redirect to another origin is an error", async () => {
    const { get } = setup([{ response: { url: "https://elsewhere.example/" } }]);

    expect(await get()).toEqual({ kind: "error", status: 200, message: "redirected off-site" });
  });

  test("a redirect to a page robots.txt forbids is blocked", async () => {
    const forbidden = `${ORIGIN}/trazenje?q=tv`;
    const { get, calls } = setup([{ response: { url: forbidden } }], {
      allowed: (url) => url !== forbidden,
    });

    expect(await get()).toEqual({ kind: "blocked", status: 0, reason: "robots" });
    expect(calls()).not.toContain("content");
  });

  test("relaunches after the browser disconnected", async () => {
    const { get, browsers, calls } = setup([{}, {}]);

    expect(await get()).toMatchObject({ kind: "ok" });
    browsers[0].connected = false;
    expect(await get()).toMatchObject({ kind: "ok" });

    expect(calls().filter((call) => call === "launch")).toHaveLength(2);
  });

  test("a browser that crashes in newPage is an error, and the next get relaunches", async () => {
    const { get, calls } = setup([{}], { crashOnNewPage: 1 });

    expect(await get()).toEqual({ kind: "error", message: "browser: Target closed" });
    expect(await get()).toMatchObject({ kind: "ok" });

    expect(calls().filter((call) => call === "launch")).toHaveLength(2);
  });

  test("abort during navigation rejects with the reason and closes the page", async () => {
    const { source, pagesClosed, run } = setup([{ response: "hang" }]);
    const controller = new AbortController();
    const reason = new Error("stop");

    const pending = source.get(LISTING, controller.signal, HINTS);
    const settled = pending.catch((error: unknown) => error);
    await run(Promise.resolve());
    controller.abort(reason);

    expect(await settled).toBe(reason);
    expect(pagesClosed).toEqual([true]);
  });

  test("close() closes the browser it launched", async () => {
    const { get, source, browsers } = setup([{}]);

    await get();
    await source.close();

    expect(browsers.map((browser) => browser.closed)).toEqual([true]);
  });

  test("close() without a get launches nothing", async () => {
    const { source, calls } = setup([{}]);

    await source.close();

    expect(calls()).toEqual([]);
  });

  test("a get without browser hints is an error", async () => {
    const { source, run, calls } = setup([{}]);

    expect(await run(source.get(LISTING))).toEqual({
      kind: "error",
      message: "no browser hints for this page",
    });
    expect(calls()).toEqual([]);
  });
});
