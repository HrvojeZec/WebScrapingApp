import type { CreateScrapeBody, CreateScrapeResponse, ScrapeJobDto } from "@storeseeker/shared";
import { API_ROUTES } from "@/shared/api/api-routes";
import { baseApi } from "@/shared/api/base-api";

export const createScrape = (body: CreateScrapeBody) =>
  baseApi.post<CreateScrapeResponse>(API_ROUTES.scrapes, body);

export const getScrape = (id: string) => baseApi.get<ScrapeJobDto>(API_ROUTES.scrape(id));
