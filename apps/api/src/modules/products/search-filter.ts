import type { FilterQuery } from "mongoose";
import { toSearchText } from "@storeseeker/shared";
import type { ProductFields } from "../../db/models/product";

export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function searchWords(q: string): string[] {
  return toSearchText(q).split(" ").filter(Boolean);
}

/** Where the first word of q starts in searchText; $indexOfCP takes it literally. */
export function relevanceRank(q: string) {
  return { $indexOfCP: ["$searchText", searchWords(q)[0] ?? ""] };
}

/** Every word of q, as a literal, somewhere in searchText: "galax" finds "Galaxy". */
export function searchTermsMatch(q: string): FilterQuery<ProductFields> {
  return {
    $and: searchWords(q).map((word) => ({ searchText: { $regex: escapeRegExp(word) } })),
  };
}
