import { Types } from "mongoose";

export interface StoreName {
  storeName: string;
}

export interface Error {
  status?: number;
  products?: string;
  message?: string;
}

export interface Keyword {
  keyword: string;
}

export interface ScrapeId {
  scrapeId: Types.ObjectId;
}
