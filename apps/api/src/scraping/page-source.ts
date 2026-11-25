import type { PoliteFetch } from "./http/polite-fetch";

/** Where the worker gets a page from: the polite HTTP client now, a browser in plan D. */
export type PageSource = Pick<PoliteFetch, "get">;
