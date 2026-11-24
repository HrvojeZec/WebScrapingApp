import { describe, expect, test } from "vitest";
import { createPoliteFetch } from "../polite-fetch";
import { botUserAgent } from "../user-agent";
import { createFakeClock, createFakeFetch, html, status, withRobots } from "./fakes";

const SEARCH = "https://www.mall.hr/trazenje?s=iphone";
const CATEGORY = "https://www.mall.hr/mobilni-telefoni?s=iphone";
const HOUR = 3_600_000;

function setup(robots: () => Response | Promise<Response>) {
  const fake = createFakeClock();
  const http = createFakeFetch(
    fake.clock,
    withRobots(() => html("ok"), robots),
  );
  const polite = createPoliteFetch({
    userAgent: botUserAgent("0.3.0"),
    fetch: http.fetch,
    clock: fake.clock,
  });
  return { ...fake, http, get: (url: string) => fake.run(polite.get(url)) };
}

describe("robots.txt", () => {
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
