import { useQuery } from "@tanstack/react-query";
import { scrapeJobQuery } from "../api/queries";

/** A refresh job, polled every LIMITS.scrapePollIntervalMs until it is finished; null: none. */
export const useScrapeJob = (id: string | null) => useQuery(scrapeJobQuery(id));
