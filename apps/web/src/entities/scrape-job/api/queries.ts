import { LIMITS } from "@storeseeker/shared";
import { queryOptions, skipToken } from "@tanstack/react-query";
import { isJobFinished } from "../lib/job-status";
import { getScrape } from "./scrapes.api";
import { scrapeKeys } from "./query-keys";

// Polls until the job is done; it stops on its own when no component reads the job any more.
// Without an id there is nothing to poll yet.
export const scrapeJobQuery = (id: string | null) =>
  queryOptions({
    queryKey: scrapeKeys.job(id),
    queryFn: id === null ? skipToken : () => getScrape(id),
    refetchInterval: ({ state }) =>
      state.data && isJobFinished(state.data.status) ? false : LIMITS.scrapePollIntervalMs,
  });
