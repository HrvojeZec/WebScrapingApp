import { describe, expect, test } from "vitest";
import { crawlCategory } from "../crawl-category";
import { fakeAdapter, fakeSource, pageUrl, product, type FakeAnswer } from "./fakes";

const PHONES = pageUrl("phones");

function crawl(answers: Record<string, FakeAnswer>, maxPages = 10, lists = [PHONES]) {
  const { source, calls } = fakeSource(answers);
  const signal = new AbortController().signal;
  const result = crawlCategory(
    { source, maxPages, signal },
    fakeAdapter({ mobiteli: lists }),
    "mobiteli",
  );
  return { result, calls };
}

describe("crawlCategory", () => {
  test("follows the pages to the last one and drops duplicates", async () => {
    const { result } = crawl({
      [PHONES]: { items: [product("1"), product("2")], next: pageUrl("phones", 2) },
      [pageUrl("phones", 2)]: { items: [product("2"), product("3")], next: pageUrl("phones", 3) },
      [pageUrl("phones", 3)]: { items: [product("4")], next: null },
    });
    const crawled = await result;
    expect(crawled).toMatchObject({ status: "ok", complete: true, pages: 3, error: null });
    expect(crawled.products.map((p) => p.externalId)).toEqual(["1", "2", "3", "4"]);
  });

  test("stops at maxPages while a next page exists", async () => {
    const answers: Record<string, FakeAnswer> = {};
    for (let page = 1; page <= 5; page += 1) {
      answers[pageUrl("phones", page)] = {
        items: [product(String(page))],
        next: pageUrl("phones", page + 1),
      };
    }
    const { result, calls } = crawl(answers, 2);
    expect(await result).toMatchObject({
      status: "partial",
      complete: false,
      pages: 2,
      error: "page limit",
    });
    expect(calls).toHaveLength(2);
  });

  test("a blocked first page is blocked", async () => {
    const { result } = crawl({ [PHONES]: { kind: "blocked", status: 403, reason: "forbidden" } });
    expect(await result).toMatchObject({ status: "blocked", complete: false, products: [] });
  });

  test("a failed first page is an error with the outcome's message", async () => {
    const { result } = crawl({ [PHONES]: { kind: "error", status: 500, message: "HTTP 500" } });
    expect(await result).toMatchObject({ status: "error", error: "HTTP 500", products: [] });
  });

  test("a first page without products is an error, not an empty category", async () => {
    const { result } = crawl({ [PHONES]: { items: [], next: null } });
    expect(await result).toMatchObject({
      status: "error",
      complete: false,
      error: "no products parsed",
    });
  });

  test("a failed later page keeps the products read so far as partial", async () => {
    const { result } = crawl({
      [PHONES]: { items: [product("1")], next: pageUrl("phones", 2) },
      [pageUrl("phones", 2)]: { kind: "error", message: "timeout" },
    });
    const crawled = await result;
    expect(crawled).toMatchObject({ status: "partial", complete: false, pages: 1 });
    expect(crawled.error).toContain("timeout");
    expect(crawled.products.map((p) => p.externalId)).toEqual(["1"]);
  });

  test("a next page on another origin is partial and never fetched", async () => {
    const { result, calls } = crawl({
      [PHONES]: { items: [product("1")], next: "https://elsewhere.example/phones?p=2" },
    });
    expect(await result).toMatchObject({ status: "partial", error: "next page off-site" });
    expect(calls).toEqual([PHONES]);
  });

  test("a next page that was already read ends the crawl as complete", async () => {
    const { result, calls } = crawl({
      [PHONES]: { items: [product("1")], next: pageUrl("phones", 2) },
      [pageUrl("phones", 2)]: { items: [product("2")], next: PHONES },
    });
    expect(await result).toMatchObject({ status: "ok", complete: true, pages: 2 });
    expect(calls).toHaveLength(2);
  });

  test("a category with two listings is complete only when both reach their last page", async () => {
    const apple = pageUrl("apple");
    const both = crawl(
      {
        [PHONES]: { items: [product("1")], next: null },
        [apple]: { items: [product("2")], next: null },
      },
      10,
      [PHONES, apple],
    );
    const crawled = await both.result;
    expect(crawled).toMatchObject({ status: "ok", complete: true, pages: 2 });
    expect(crawled.products.map((p) => p.externalId)).toEqual(["1", "2"]);

    const secondFails = crawl(
      {
        [PHONES]: { items: [product("1")], next: null },
        [apple]: { kind: "error", message: "HTTP 500" },
      },
      10,
      [PHONES, apple],
    );
    expect(await secondFails.result).toMatchObject({
      status: "partial",
      complete: false,
      error: "HTTP 500",
    });
  });

  test("a browser adapter sends its hints with every page, an http adapter none", async () => {
    const answers: Record<string, FakeAnswer> = {
      [PHONES]: { items: [product("1")], next: pageUrl("phones", 2) },
      [pageUrl("phones", 2)]: { items: [product("2")], next: null },
    };
    const browser = { waitForSelector: ".card", extraHosts: ["api.shop.example"] };
    const signal = new AbortController().signal;

    const viaBrowser = fakeSource(answers);
    await crawlCategory(
      { source: viaBrowser.source, maxPages: 10, signal },
      fakeAdapter({ mobiteli: [PHONES] }, { fetchMethod: "browser", browser }),
      "mobiteli",
    );
    expect(viaBrowser.hints).toEqual([browser, browser]);

    const viaHttp = fakeSource(answers);
    await crawlCategory(
      { source: viaHttp.source, maxPages: 10, signal },
      fakeAdapter({ mobiteli: [PHONES] }),
      "mobiteli",
    );
    expect(viaHttp.hints).toEqual([undefined, undefined]);
  });

  test("the adapter's maxPages caps the crawl below the job's", async () => {
    const { source, calls } = fakeSource({
      [PHONES]: { items: [product("1")], next: pageUrl("phones", 2) },
      [pageUrl("phones", 2)]: { items: [product("2")], next: null },
    });

    const result = await crawlCategory(
      { source, maxPages: 10, signal: new AbortController().signal },
      fakeAdapter({ mobiteli: [PHONES] }, { maxPages: 1 }),
      "mobiteli",
    );

    expect(result).toMatchObject({ status: "partial", pages: 1, error: "page limit" });
    expect(calls).toEqual([PHONES]);
  });

  test("an aborted signal rejects", async () => {
    const { source } = fakeSource({ [PHONES]: "hang" });
    const controller = new AbortController();
    const result = crawlCategory(
      { source, maxPages: 10, signal: controller.signal },
      fakeAdapter({ mobiteli: [PHONES] }),
      "mobiteli",
    );
    controller.abort(new Error("stopped"));
    await expect(result).rejects.toThrow("stopped");
  });
});
