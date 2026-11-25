import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { CategorySlug } from "@storeseeker/shared";
import { productKeys } from "@/entities/product/api/query-keys";
import { useCreateScrape } from "@/entities/scrape-job/hooks/useCreateScrape";
import { useScrapeJob } from "@/entities/scrape-job/hooks/useScrapeJob";
import { isJobFinished } from "@/entities/scrape-job/lib/job-status";
import { storeKeys } from "@/entities/store/api/query-keys";
import { useStores } from "@/entities/store/hooks/useStores";
import {
  describeFresh,
  describeRefresh,
  describeRefreshError,
  refreshStoreLines,
} from "../lib/describe-refresh";

/**
 * "Osvježi cijene": queues a crawl of `categories`, follows the job until it is done and then
 * reloads products and stores, so the component only shows what this returns.
 */
export function useRefreshPrices(categories: CategorySlug[]) {
  const queryClient = useQueryClient();
  const create = useCreateScrape();
  const stores = useStores();
  const jobId = create.data && !create.data.fresh ? create.data.job.id : null;
  const jobQuery = useScrapeJob(jobId);
  const job = jobQuery.data ?? null;
  const finished = job !== null && isJobFinished(job.status);

  useEffect(() => {
    if (!finished) return;
    void queryClient.invalidateQueries({ queryKey: productKeys.all });
    void queryClient.invalidateQueries({ queryKey: storeKeys.all });
  }, [finished, jobId, queryClient]);

  let message: string | null = null;
  if (create.data?.fresh) message = describeFresh(create.data.lastCrawledAt);
  else if (job) message = describeRefresh(job);

  const failure = create.error ?? jobQuery.error;

  return {
    start: () => create.mutate({ categories }),
    job,
    message,
    storeLines: job ? refreshStoreLines(job.perStore, stores.data ?? []) : [],
    error: failure ? describeRefreshError(failure) : null,
    isRunning: create.isPending || (job !== null && !finished),
  };
}
