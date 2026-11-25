// Relative on purpose: Vite proxies /api to the API, so the web and the API share one origin.
const API = "/api";

/** Paths of the API endpoints the web calls. */
export const API_ROUTES = {
  health: `${API}/health`,
  meta: `${API}/meta`,
  stores: `${API}/stores`,
  products: `${API}/products`,
  product: (id: string) => `${API}/products/${encodeURIComponent(id)}`,
  productHistory: (id: string) => `${API}/products/${encodeURIComponent(id)}/history`,
  deals: `${API}/deals`,
  suggestions: `${API}/suggestions`,
  scrapes: `${API}/scrapes`,
  scrape: (id: string) => `${API}/scrapes/${encodeURIComponent(id)}`,
} as const;
