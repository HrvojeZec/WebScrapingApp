import { useQueryClient } from "@tanstack/react-query";
import { productKeys } from "../api/query-keys";
import { findCachedProduct } from "../lib/cached-product";

/** The product as an earlier search or product page fetched it, or null; never a request. */
export function useProductPreview(id: string) {
  const queryClient = useQueryClient();
  const cached = queryClient.getQueriesData({ queryKey: productKeys.all }).map(([, data]) => data);
  return findCachedProduct(cached, id);
}
