import type { CreateScrapeBody } from "@storeseeker/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createScrape } from "../api/scrapes.api";
import { scrapeKeys } from "../api/query-keys";

/** POST /api/scrapes; a queued job goes into the cache, so polling starts from it. */
export function useCreateScrape() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateScrapeBody) => createScrape(body),
    onSuccess: (response) => {
      if (!response.fresh) queryClient.setQueryData(scrapeKeys.job(response.job.id), response.job);
    },
  });
}
