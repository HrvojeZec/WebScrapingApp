import { productsQuerySchema, searchTermSchema, type ProductsQuery } from "@storeseeker/shared";

/** A search as the URL holds it; the page size is the API's default and never in the URL. */
export type SearchState = Omit<ProductsQuery, "pageSize">;

/** A parameter of the URL that was dropped, with the schema's sentence about it. */
export type SearchIssue = { path: string; message: string };

const SEARCH_KEYS = ["q", "category", "store", "min", "max", "discounted", "sort", "page"] as const;
type SearchKey = (typeof SEARCH_KEYS)[number];

const LIST_KEYS: ReadonlySet<SearchKey> = new Set(["category", "store"]);

const DEFAULTS = { discounted: false, sort: "relevance", page: 1 } as const;

function readRaw(params: URLSearchParams): Partial<Record<SearchKey, string | string[]>> {
  const raw: Partial<Record<SearchKey, string | string[]>> = {};
  for (const key of SEARCH_KEYS) {
    const values = params.getAll(key);
    if (values.length === 0) continue;
    raw[key] = LIST_KEYS.has(key) ? values : values[0];
  }
  return raw;
}

/**
 * Reads the search from the URL with the API's own schema. A broken parameter is dropped and the
 * rest is kept, so a hand-edited or stale link still shows results instead of an error page.
 */
export function parseSearchParams(params: URLSearchParams): {
  state: SearchState;
  issues: SearchIssue[];
} {
  const raw = readRaw(params);
  const issues: SearchIssue[] = [];

  for (;;) {
    const result = productsQuerySchema.safeParse(raw);
    if (result.success) {
      const { pageSize, ...state } = result.data;
      return { state, issues };
    }

    let dropped = false;
    for (const issue of result.error.issues) {
      const path = String(issue.path[0] ?? "");
      issues.push({ path, message: issue.message });
      // The min > max check: neither price alone is wrong, so the search runs without both
      const keys: SearchKey[] = issue.code === "custom" ? ["min", "max"] : [path as SearchKey];
      for (const key of keys) {
        if (key in raw) {
          delete raw[key];
          dropped = true;
        }
      }
    }
    if (!dropped) return { state: { ...DEFAULTS }, issues };
  }
}

/** The search as URL parameters, without the values the API uses anyway. */
export function toSearchParams(state: Partial<SearchState>): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  for (const category of state.category ?? []) params.append("category", category);
  for (const store of state.store ?? []) params.append("store", store);
  if (state.min !== undefined) params.set("min", String(state.min));
  if (state.max !== undefined) params.set("max", String(state.max));
  if (state.discounted) params.set("discounted", "true");
  if (state.sort && state.sort !== DEFAULTS.sort) params.set("sort", state.sort);
  if (state.page && state.page !== DEFAULTS.page) params.set("page", String(state.page));
  return params;
}

/** The term as the user typed it (case kept, spaces tidied), for headings; undefined if invalid. */
export function searchTermAsTyped(params: URLSearchParams): string | undefined {
  const raw = params.get("q");
  if (raw === null || !searchTermSchema.safeParse(raw).success) return undefined;
  return raw.normalize("NFC").trim().replace(/\s+/g, " ");
}
