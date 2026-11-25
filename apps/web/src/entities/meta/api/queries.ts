import { queryOptions } from "@tanstack/react-query";
import { getMeta } from "./meta.api";
import { metaKeys } from "./query-keys";

// The data set (demo seed or real crawl) does not change while the app is open
export const metaQuery = () =>
  queryOptions({ queryKey: metaKeys.all, queryFn: getMeta, staleTime: Infinity });
