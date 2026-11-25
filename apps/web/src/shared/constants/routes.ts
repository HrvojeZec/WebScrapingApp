/** Paths of the web app's pages. */
export const ROUTES = {
  home: "/",
  search: "/pretraga",
  product: (id: string) => `/proizvod/${encodeURIComponent(id)}`,
  /** Any path no other route matches */
  notFound: "*",
} as const;
