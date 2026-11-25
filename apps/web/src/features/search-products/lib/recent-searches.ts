import { normalizeSearchTerm } from "@storeseeker/shared";
import { WEB_STORAGE_KEYS } from "@/shared/constants/storage-keys";

/** `term` first, without an earlier copy of it, cut to `max` terms. */
export function addRecentSearch(list: string[], term: string, max: number): string[] {
  const normalized = normalizeSearchTerm(term);
  if (!normalized) return list;
  const rest = list.filter((item) => normalizeSearchTerm(item) !== normalized);
  return [normalized, ...rest].slice(0, max);
}

export function readRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(WEB_STORAGE_KEYS.recentSearches);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeRecentSearches(list: string[]): void {
  try {
    localStorage.setItem(WEB_STORAGE_KEYS.recentSearches, JSON.stringify(list));
  } catch {
    // Blocked or full storage only costs the recent searches, never the search itself
  }
}
