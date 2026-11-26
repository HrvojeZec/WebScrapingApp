import { describe, expect, test } from "vitest";
import { createPoliteFetch, type PoliteFetchOptions } from "../polite-fetch";
import { botUserAgent } from "../user-agent";
import {
  createFakeClock,
  createFakeFetch,
  html,
  never,
  redirectedTo,
  status,
  withRobots,
} from "./fakes";

const SHOP = "https://www.shop.example/trazenje?s=iphone";
const SHOP_PAGE_2 = "https://www.shop.example/trazenje?pagination=2&s=iphone";
const OTHER_SHOP = "https://www.other-shop.example/mobiteli?page=1";
const MB = 1024 * 1024;
const CHALLENGE_BODY =
  '<html><head><title>Just a moment...</title></head><body><script src="/cdn-cgi/challenge-platform/h/g/orchestrate/chl_page/v1?ray=1"></script><form id="cf-chl-form"></form></body></html>';

type Handler = Parameters<typeof withRobots>[0];

function setup(page: Handler, options: Partial<PoliteFetchOptions> = {}) {
  const fake = createFakeClock();
  const http = createFakeFetch(fake.clock, withRobots(page));
  const polite = createPoliteFetch({
    userAgent: botUserAgent("0.3.0"),
    fetch: http.fetch,
    clock: fake.clock,
    // The queue tests below measure this gap, so they do not follow LIMITS.requestIntervalMs
    minIntervalMs: 2_000,
    ...options,
  });
  const get = (url: string) => fake.run(polite.get(url));
  return { ...fake, http, polite, get };
}

/** Answers the page URL with the given responses in turn. */
function sequence(...responses: (() => Response | Promise<Response>)[]): Handler {
  let call = 0;
  return () => {
    const next = responses[Math.min(call, responses.length - 1)];
    call += 1;
    return next();
  };
}

describe("botUserAgent", () => {
  test("names the bot, its version and the repository", () => {
    expect(botUserAgent("0.3.0")).toBe(
      "StoreSeekerBot/0.3.0 (+https://github.com/HrvojeZec/WebScrapingApp)",
    );
  });
});

describe("createPoliteFetch", () => {
  test("sends the bot User-Agent and Accept-Language: hr and returns the HTML", async () => {
    const { get, http } = setup(() => html("<p>ok</p>"));

    expect(await get(SHOP)).toEqual({ kind: "ok", status: 200, url: SHOP, html: "<p>ok</p>" });
    for (const call of http.calls) {
      expect(call.headers.get("user-agent")).toBe(botUserAgent("0.3.0"));
      expect(call.headers.get("accept-language")).toBe("hr");
    }
  });

  describe("queue per origin", () => {
    test("starts the next request to a host 2 s after the previous one, other hosts at once", async () => {
      const { run, polite, http } = setup(() => html("ok"));

      await run(Promise.all([polite.get(SHOP), polite.get(SHOP_PAGE_2), polite.get(OTHER_SHOP)]));

      const at = (url: string) => http.pageCalls().find((call) => call.url === url)!.at;
      expect(at(SHOP_PAGE_2) - at(SHOP)).toBeGreaterThanOrEqual(2000);
      // robots.txt took the first slot of each host, so both first pages start together
      expect(at(OTHER_SHOP)).toBe(at(SHOP));
    });

    test("robots.txt goes through the same queue as the pages", async () => {
      const { get, http } = setup(() => html("ok"));

      await get(SHOP);

      const [robots, page] = http.calls;
      expect(robots.url).toBe("https://www.shop.example/robots.txt");
      expect(page.at - robots.at).toBe(2000);
    });

    test("waitTurn shares the queue with get", async () => {
      const { run, polite, http, clock } = setup(() => html("ok"));

      await run(polite.get(SHOP));
      await run(polite.waitTurn("https://www.shop.example"));

      expect(clock.now() - http.pageCalls()[0].at).toBe(2000);
    });
  });

  describe("the gate for the browser", () => {
    test("isAllowed reads robots.txt once, shared with get", async () => {
      const fake = createFakeClock();
      const http = createFakeFetch(
        fake.clock,
        withRobots(
          () => html("ok"),
          () => html("User-agent: *\nDisallow: /trazenje"),
        ),
      );
      const polite = createPoliteFetch({
        userAgent: botUserAgent("0.3.0"),
        fetch: http.fetch,
        clock: fake.clock,
      });

      expect(await fake.run(polite.isAllowed(SHOP))).toBe(false);
      expect(await fake.run(polite.isAllowed("https://www.shop.example/mobiteli"))).toBe(true);
      expect(await fake.run(polite.get(SHOP))).toEqual({
        kind: "blocked",
        status: 0,
        reason: "robots",
      });
      expect(http.robotsCalls()).toHaveLength(1);
      expect(http.pageCalls()).toHaveLength(0);
    });

    test("pause holds the next get to that origin until the given time", async () => {
      const { polite, get, http, clock } = setup(() => html("ok"));
      await get(SHOP);
      const until = clock.now() + 90_000;

      polite.pause("https://www.shop.example", until);
      await get(SHOP_PAGE_2);

      expect(http.pageCalls()[1].at).toBe(until);
    });
  });

  describe("retries", () => {
    test("retries 5xx with waits of 1 s and 2 s", async () => {
      const { get, http } = setup(
        sequence(
          () => status(503),
          () => status(503),
          () => html("ok"),
        ),
        { minIntervalMs: 0 },
      );

      expect(await get(SHOP)).toMatchObject({ kind: "ok" });
      const times = http.pageCalls().map((call) => call.at);
      expect(times).toHaveLength(3);
      expect([times[1] - times[0], times[2] - times[1]]).toEqual([1000, 2000]);
    });

    test("gives up after two retries of a 5xx", async () => {
      const { get, http } = setup(() => status(503));

      expect(await get(SHOP)).toEqual({ kind: "error", status: 503, message: "HTTP 503" });
      expect(http.pageCalls()).toHaveLength(3);
    });

    test("retries a network error", async () => {
      const { get, http } = setup(
        sequence(
          () => Promise.reject(new TypeError("fetch failed")),
          () => html("ok"),
        ),
      );

      expect(await get(SHOP)).toMatchObject({ kind: "ok" });
      expect(http.pageCalls()).toHaveLength(2);
    });

    test("reports the network error when retries run out", async () => {
      const { get } = setup(() =>
        Promise.reject(new TypeError("fetch failed", { cause: { code: "ECONNRESET" } })),
      );

      expect(await get(SHOP)).toEqual({ kind: "error", message: "fetch failed (ECONNRESET)" });
    });

    test("does not retry other 4xx", async () => {
      const { get, http } = setup(() => status(404));

      expect(await get(SHOP)).toEqual({ kind: "error", status: 404, message: "HTTP 404" });
      expect(http.pageCalls()).toHaveLength(1);
    });
  });

  describe("429", () => {
    test("is rate_limited with Retry-After in seconds, and pauses the host until then", async () => {
      const { get, http } = setup(
        sequence(
          () => status(429, { "retry-after": "120" }),
          () => html("ok"),
        ),
      );

      expect(await get(SHOP)).toEqual({
        kind: "blocked",
        status: 429,
        reason: "rate_limited",
        retryAfterMs: 120_000,
      });
      expect(http.pageCalls()).toHaveLength(1);

      await get(SHOP_PAGE_2);
      const [first, second] = http.pageCalls();
      expect(second.at - first.at).toBeGreaterThanOrEqual(120_000);
    });

    test("reads Retry-After as an HTTP date", async () => {
      const fake = createFakeClock();
      const http = createFakeFetch(
        fake.clock,
        withRobots(() =>
          status(429, { "retry-after": new Date(fake.clock.now() + 90_000).toUTCString() }),
        ),
      );
      const polite = createPoliteFetch({ userAgent: "t", fetch: http.fetch, clock: fake.clock });

      expect(await fake.run(polite.get(SHOP))).toMatchObject({ retryAfterMs: 90_000 });
    });

    test("waits 60 s when Retry-After is neither seconds nor an HTTP date", async () => {
      for (const value of ["-5", "1.5", "soon"]) {
        expect(await setup(() => status(429, { "retry-after": value })).get(SHOP)).toMatchObject({
          retryAfterMs: 60_000,
        });
      }
    });

    test("waits 60 s without Retry-After and at most 1 h", async () => {
      expect(await setup(() => status(429)).get(SHOP)).toMatchObject({ retryAfterMs: 60_000 });
      expect(await setup(() => status(429, { "retry-after": "86400" })).get(SHOP)).toMatchObject({
        retryAfterMs: 3_600_000,
      });
    });
  });

  describe("bot protection", () => {
    test("403 is forbidden", async () => {
      expect(await setup(() => status(403)).get(SHOP)).toEqual({
        kind: "blocked",
        status: 403,
        reason: "forbidden",
      });
    });

    test("403 with cf-mitigated: challenge is a challenge", async () => {
      expect(await setup(() => status(403, { "cf-mitigated": "challenge" })).get(SHOP)).toEqual({
        kind: "blocked",
        status: 403,
        reason: "challenge",
      });
    });

    test("a 200 challenge page is a challenge, not products", async () => {
      expect(await setup(() => html(CHALLENGE_BODY)).get(SHOP)).toEqual({
        kind: "blocked",
        status: 200,
        reason: "challenge",
      });
    });

    test("a 503 challenge page is not retried", async () => {
      const { get, http } = setup(() => html(CHALLENGE_BODY, { status: 503 }));

      expect(await get(SHOP)).toMatchObject({ kind: "blocked", reason: "challenge" });
      expect(http.pageCalls()).toHaveLength(1);
    });
  });

  describe("timeout, redirects and size", () => {
    test("a request without an answer fails with timeout after 15 s", async () => {
      const { get, http, clock } = setup(never);

      expect(await get(SHOP)).toEqual({ kind: "error", message: "timeout" });
      expect(clock.now() - http.pageCalls()[0].at).toBe(15_000);
      expect(http.pageCalls()).toHaveLength(1);
    });

    test("follows a redirect on the same origin", async () => {
      const category = "https://www.shop.example/mobilni-telefoni-apple-iphone?s=iphone";
      const { get } = setup(() => redirectedTo(category, html("ok")));

      expect(await get(SHOP)).toEqual({ kind: "ok", status: 200, url: category, html: "ok" });
    });

    test("a redirect to another origin is an error", async () => {
      const { get } = setup(() => redirectedTo("https://evil.example/", html("ok")));

      expect(await get(SHOP)).toEqual({
        kind: "error",
        status: 200,
        message: "redirected off-site",
      });
    });

    test("a body over 5 MB is an error", async () => {
      const { get } = setup(() => html("x".repeat(5 * MB + 1)));

      expect(await get(SHOP)).toEqual({
        kind: "error",
        status: 200,
        message: "response too large",
      });
    });

    test("a body of exactly 5 MB is read", async () => {
      const { get } = setup(() => html("x".repeat(5 * MB)));

      expect(await get(SHOP)).toMatchObject({ kind: "ok" });
    });

    test("a body that stops arriving fails with timeout after 15 s", async () => {
      const stalled = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("<html>"));
        },
      });
      const { get, http, clock } = setup(() => new Response(stalled, { status: 200 }));

      expect(await get(SHOP)).toEqual({ kind: "error", message: "timeout" });
      expect(clock.now() - http.pageCalls()[0].at).toBe(15_000);
    });

    test("a Content-Length over 5 MB is rejected without reading the body", async () => {
      const { get } = setup(() =>
        html("small", { headers: { "content-length": String(5 * MB + 1) } }),
      );

      expect(await get(SHOP)).toMatchObject({ kind: "error", message: "response too large" });
    });
  });

  test("an aborted signal stops the wait in the queue", async () => {
    const { run, polite } = setup(() => html("ok"));
    await run(polite.get(SHOP));
    const controller = new AbortController();

    const waiting = polite.get(SHOP_PAGE_2, controller.signal);
    controller.abort(new Error("job timed out"));

    await expect(run(waiting)).rejects.toThrow("job timed out");
  });
});
