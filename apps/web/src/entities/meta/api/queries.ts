import { queryOptions } from "@tanstack/react-query";
import { getMeta } from "./meta.api";
import { metaKeys } from "./query-keys";

// The data set (demo seed or real crawl) does not change while the app is open. Focus refetches
// only while there is no data, so the demo bar appears once an API that was down comes back.
export const metaQuery = () =>
  queryOptions({
    queryKey: metaKeys.all,
    queryFn: getMeta,
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  });
