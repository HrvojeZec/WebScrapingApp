import { describe, expect, test } from "vitest";
import { createPoliteFetch } from "../polite-fetch";
import { botUserAgent } from "../user-agent";
import { createFakeClock, createFakeFetch, html, redirectedTo, status, withRobots } from "./fakes";

const SEARCH = "https://www.mall.hr/trazenje?s=iphone";
const CATEGORY = "https://www.mall.hr/mobilni-telefoni?s=iphone";
const HOUR = 3_600_000;

type Handler = (url: string) => Response | Promise<Response>;

function setup(robots: Handler, page: Handler = () => html("ok")) {
  const fake = createFakeClock();
  const http = createFakeFetch(fake.clock, withRobots(page, robots));
  const polite = createPoliteFetch({
    userAgent: botUserAgent("0.3.0"),
    fetch: http.fetch,
    clock: fake.clock,
  });
  return { ...fake, http, polite, get: (url: string) => fake.run(polite.get(url)) };
}

describe("robots.txt", () => {
  test("a same-origin redirect to a disallowed path is blocked", async () => {
    const { get } = setup(
      () => html("User-agent: *\nDisallow: /private\n"),
      () => redirectedTo("https://www.mall.hr/private/x", html("secret")),
    );

    expect(await get(SEARCH)).toEqual({ kind: "blocked", status: 0, reason: "robots" });
  });

  test("one caller aborting does not fail another caller waiting for the same robots.txt", async () => {
    const fake = createFakeClock();
    const first = new AbortController();
    // Like real fetch: rejects when its signal aborts. Job A is cancelled while robots.txt loads.
    const slowRobots = (_url: string, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        fake.clock.sleep(1000).then(() => resolve(status(404)));
        first.abort(new Error("job A cancelled"));
      });
    const http = createFakeFetch(
      fake.clock,
      withRobots(() => html("ok"), slowRobots),
    );
    const polite = createPoliteFetch({ userAgent: "t", fetch: http.fetch, clock: fake.clock });

    const [a, b] = await fake.run(
      Promise.allSettled([polite.get(SEARCH, first.signal), polite.get(CATEGORY)]),
    );

    expect(a).toMatchObject({ status: "rejected", reason: new Error("job A cancelled") });
    expect(b).toMatchObject({ status: "fulfilled", value: { kind: "ok" } });
  });

  test("a caller waiting for a robots.txt fetched by another caller can abort its own wait", async () => {
    const fake = createFakeClock();
    const http = createFakeFetch(
      fake.clock,
      withRobots(
        () => html("ok"),
        () => new Promise(() => {}),
      ),
    );
    const polite = createPoliteFetch({ userAgent: "t", fetch: http.fetch, clock: fake.clock });
    const second = new AbortController();

    const firstGet = polite.get(SEARCH);
    const secondGet = polite.get(CATEGORY, second.signal);
    second.abort(new Error("job B cancelled"));

    await expect(fake.run(secondGet)).rejects.toThrow("job B cancelled");
    expect(await fake.run(firstGet)).toMatchObject({ kind: "blocked", reason: "robots" });
  });

  test("a disallowed URL is blocked without fetching the page", async () => {
    const { get, http } = setup(() => html("User-agent: *\nDisallow: /trazenje\n"));

    expect(await get(SEARCH)).toEqual({ kind: "blocked", status: 0, reason: "robots" });
    expect(http.pageCalls()).toHaveLength(0);
    expect(await get(CATEGORY)).toMatchObject({ kind: "ok" });
  });

  test("a group for StoreSeekerBot wins over the * group", async () => {
    const { get } = setup(() =>
      html("User-agent: *\nAllow: /\n\nUser-agent: StoreSeekerBot\nDisallow: /\n"),
    );

    expect(await get(CATEGORY)).toMatchObject({ kind: "blocked", reason: "robots" });
  });

  test("is read once per origin for 24 h", async () => {
    const { get, http, advance } = setup(() => html("User-agent: *\nAllow: /\n"));

    await get(SEARCH);
    await get(CATEGORY);
    expect(http.robotsCalls()).toHaveLength(1);

    advance(24 * HOUR);
    await get(SEARCH);
    expect(http.robotsCalls()).toHaveLength(2);
  });

  test("a 404 allows everything", async () => {
    const { get } = setup(() => status(404));

    expect(await get(SEARCH)).toMatchObject({ kind: "ok" });
  });

  test("a 503 disallows everything, for 10 minutes", async () => {
    let robots = () => status(503);
    const { get, http, advance } = setup(() => robots());

    expect(await get(SEARCH)).toMatchObject({ kind: "blocked", reason: "robots" });
    expect(http.robotsCalls()).toHaveLength(1);

    robots = () => html("User-agent: *\nAllow: /\n");
    advance(9 * 60_000);
    expect(await get(SEARCH)).toMatchObject({ kind: "blocked", reason: "robots" });
    advance(60_000);
    expect(await get(SEARCH)).toMatchObject({ kind: "ok" });
    expect(http.robotsCalls()).toHaveLength(2);
  });

  test("a network error disallows everything", async () => {
    const { get } = setup(() => Promise.reject(new TypeError("fetch failed")));

    expect(await get(SEARCH)).toMatchObject({ kind: "blocked", reason: "robots" });
  });

  test("a 429 for robots.txt disallows everything", async () => {
    const { get } = setup(() => status(429));

    expect(await get(SEARCH)).toMatchObject({ kind: "blocked", reason: "robots" });
  });
});
