import { afterEach, describe, expect, it, vi } from "vitest";
import { API_ROUTES } from "../api-routes";
import { ApiError, baseApi } from "../base-api";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const html = (body: string, status: number) =>
  new Response(body, { status, headers: { "Content-Type": "text/html" } });

/** Stubs fetch with one outcome and returns the mock, to read what the client sent. */
function respondWith(outcome: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (outcome instanceof Error) throw outcome;
    return outcome;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** The request the client made: its URL, its init and its headers. */
function sentRequest(fetchMock: ReturnType<typeof respondWith>) {
  const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
  return { url, init, headers: new Headers(init.headers) };
}

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  throw new Error("Expected the request to fail");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("baseApi", () => {
  it("returns the JSON body of a 200 response", async () => {
    respondWith(json({ demo: true, seededAt: null }));

    await expect(baseApi.get(API_ROUTES.meta)).resolves.toEqual({ demo: true, seededAt: null });
  });

  it("adds the query string to a GET and sends no body", async () => {
    const fetchMock = respondWith(json({ items: [] }));

    await baseApi.get(API_ROUTES.products, new URLSearchParams("q=tv"));

    const { url, init, headers } = sentRequest(fetchMock);
    expect(url).toBe("/api/products?q=tv");
    expect(init.method).toBe("GET");
    expect(init.body).toBeUndefined();
    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.has("Content-Type")).toBe(false);
    expect(init.credentials).toBe("same-origin");
  });

  it("sends a POST body as JSON", async () => {
    const fetchMock = respondWith(json({ id: "1" }, 202));

    await baseApi.post(API_ROUTES.scrapes, { q: "tv" });

    const { init, headers } = sentRequest(fetchMock);
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"q":"tv"}');
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("sends PUT and PATCH with their own method and a body", async () => {
    for (const [call, method] of [
      [() => baseApi.put("/api/x", { a: 1 }), "PUT"],
      [() => baseApi.patch("/api/x", { a: 1 }), "PATCH"],
    ] as const) {
      const fetchMock = respondWith(new Response(null, { status: 204 }));
      await call();
      const { init } = sentRequest(fetchMock);
      expect(init.method).toBe(method);
      expect(init.body).toBe('{"a":1}');
    }
  });

  it("sends DELETE without a body and returns undefined for 204 No Content", async () => {
    const fetchMock = respondWith(new Response(null, { status: 204 }));

    await expect(baseApi.delete("/api/x")).resolves.toBeUndefined();

    const { init, headers } = sentRequest(fetchMock);
    expect(init.method).toBe("DELETE");
    expect(init.body).toBeUndefined();
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("throws the code, message and status the API sent", async () => {
    respondWith(json({ error: { code: "not_found", message: "Proizvod ne postoji." } }, 404));

    const error = await caught(baseApi.get(API_ROUTES.product("abc")));

    expect(error.code).toBe("not_found");
    expect(error.message).toBe("Proizvod ne postoji.");
    expect(error.status).toBe(404);
    expect(error.resetAt).toBeNull();
  });

  it("carries resetAt of a 429", async () => {
    const resetAt = "2026-11-25T15:00:00.000Z";
    respondWith(
      json({ error: { code: "rate_limited", message: "Previše zahtjeva.", resetAt } }, 429),
    );

    const error = await caught(baseApi.post(API_ROUTES.scrapes, { q: "tv" }));

    expect(error.code).toBe("rate_limited");
    expect(error.status).toBe(429);
    expect(error.resetAt).toBe(resetAt);
  });

  it("reports a network failure as code network without a status", async () => {
    respondWith(new TypeError("Failed to fetch"));

    const error = await caught(baseApi.get(API_ROUTES.meta));

    expect(error.code).toBe("network");
    expect(error.status).toBeNull();
  });

  it("reports a 502 with an HTML body as unavailable", async () => {
    respondWith(html("<html>Bad Gateway</html>", 502));

    const error = await caught(baseApi.get(API_ROUTES.meta));

    expect(error.code).toBe("unavailable");
    expect(error.status).toBe(502);
  });

  it("reports HTML instead of JSON on a 200 as unavailable", async () => {
    respondWith(html("<!doctype html><html></html>", 200));

    const error = await caught(baseApi.get(API_ROUTES.meta));

    expect(error.code).toBe("unavailable");
    expect(error.status).toBe(200);
  });
});
