import {
  focusManager,
  QueryClient,
  QueryObserver,
  type QueryObserverResult,
} from "@tanstack/react-query";
import type { MetaDto } from "@storeseeker/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QUERY_DEFAULTS } from "@/shared/api/query-client";
import { metaQuery } from "../queries";

afterEach(() => {
  vi.unstubAllGlobals();
  focusManager.setFocused(undefined);
});

/** Resolves once the observer reports a result that `done` accepts. */
function waitFor(
  observer: QueryObserver<MetaDto, Error, MetaDto, MetaDto, readonly ["meta"]>,
  done: (result: QueryObserverResult<MetaDto>) => boolean,
) {
  return new Promise<void>((resolve) => {
    const unsubscribe = observer.subscribe((result) => {
      if (done(result)) {
        unsubscribe();
        resolve();
      }
    });
  });
}

describe("metaQuery", () => {
  it("fetches again when the window regains focus after the API was down", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValue(
        new Response(JSON.stringify({ demo: true, seededAt: null }), {
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);
    const client = new QueryClient({
      defaultOptions: { ...QUERY_DEFAULTS, queries: { ...QUERY_DEFAULTS.queries, retry: false } },
    });
    // QueryClientProvider mounts the client in the app; mounting wires it to the focus events
    client.mount();
    const observer = new QueryObserver(client, metaQuery());
    const keepAlive = observer.subscribe(() => {});

    await waitFor(observer, (result) => result.isError);
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    await waitFor(observer, (result) => result.data?.demo === true);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    keepAlive();
    client.unmount();
  });
});
