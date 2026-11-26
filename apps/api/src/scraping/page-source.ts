import type { FetchOutcome } from "./http/polite-fetch";
import type { BrowserHints } from "./shops/types";

/** Where the worker gets a page from: the polite HTTP client, or a headless browser. */
export type PageSource = {
  /** Rejects only when `signal` aborts. The HTTP client ignores `hints`. */
  get(url: string, signal?: AbortSignal, hints?: BrowserHints): Promise<FetchOutcome>;
};
