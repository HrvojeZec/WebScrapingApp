import { describe, expect, test } from "vitest";
import { shouldBlockRequest } from "../request-filter";

const PAGE_ORIGIN = "https://www.shop.example";

const request = (url: string, resourceType: string) => ({ url, resourceType });

describe("shouldBlockRequest", () => {
  // Chrome asks for /favicon.ico on its own as "other", outside robots.txt and the queue
  test.each(["image", "font", "media", "other", "manifest", "ping"])(
    "blocks a %s from the shop itself",
    (type) => {
      expect(shouldBlockRequest(request(`${PAGE_ORIGIN}/static/a.bin`, type), PAGE_ORIGIN)).toBe(
        true,
      );
    },
  );

  test.each(["document", "script", "xhr", "fetch", "stylesheet"])(
    "lets a %s from the shop through",
    (type) => {
      expect(shouldBlockRequest(request(`${PAGE_ORIGIN}/static/a`, type), PAGE_ORIGIN)).toBe(false);
    },
  );

  // Spike 26.11.: Emmezeta serves a first-party tracker from a subdomain; prices need none
  test("blocks a script from a subdomain of the shop", () => {
    expect(
      shouldBlockRequest(
        request("https://qsdw1.f3afe979bb2f29b4.emmezeta.hr/t.js", "script"),
        "https://www.emmezeta.hr",
      ),
    ).toBe(true);
  });

  test("blocks other hosts unless the adapter lists them", () => {
    const gtm = request("https://www.googletagmanager.com/gtm.js", "script");
    expect(shouldBlockRequest(gtm, PAGE_ORIGIN)).toBe(true);
    expect(shouldBlockRequest(gtm, PAGE_ORIGIN, ["www.googletagmanager.com"])).toBe(false);
  });

  test("lets an image from a listed host through only if it is not an image", () => {
    expect(
      shouldBlockRequest(request("https://cdn.example/a.png", "image"), PAGE_ORIGIN, [
        "cdn.example",
      ]),
    ).toBe(true);
  });

  test("lets data: URLs through", () => {
    expect(shouldBlockRequest(request("data:text/css,a{}", "stylesheet"), PAGE_ORIGIN)).toBe(false);
  });

  test("blocks a URL it cannot read", () => {
    expect(shouldBlockRequest(request("not a url", "script"), PAGE_ORIGIN)).toBe(true);
  });
});
