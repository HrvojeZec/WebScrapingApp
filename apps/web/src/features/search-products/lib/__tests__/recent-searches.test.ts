import { afterEach, describe, expect, it, vi } from "vitest";
import { WEB_STORAGE_KEYS } from "@/shared/constants/storage-keys";
import { addRecentSearch, readRecentSearches, writeRecentSearches } from "../recent-searches";

/** A localStorage stand-in holding the given items. */
function stubStorage(items: Record<string, string> = {}) {
  const store = new Map(Object.entries(items));
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  });
  return store;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("addRecentSearch", () => {
  it("puts a new term first", () => {
    expect(addRecentSearch(["tv", "laptop"], "mobitel", 5)).toEqual(["mobitel", "tv", "laptop"]);
  });

  it("treats terms that normalize alike as one and moves it to the front", () => {
    expect(addRecentSearch(["tv", "slušalice"], "  Slušalice ", 5)).toEqual(["slušalice", "tv"]);
  });

  it("keeps at most max terms", () => {
    expect(addRecentSearch(["a1", "a2", "a3"], "a4", 3)).toEqual(["a4", "a1", "a2"]);
  });
});

describe("readRecentSearches", () => {
  it("reads what writeRecentSearches stored", () => {
    const store = stubStorage();

    writeRecentSearches(["tv", "laptop"]);

    expect(store.get(WEB_STORAGE_KEYS.recentSearches)).toBe('["tv","laptop"]');
    expect(readRecentSearches()).toEqual(["tv", "laptop"]);
  });

  it("gives an empty list for nothing stored, broken JSON or the wrong shape", () => {
    stubStorage();
    expect(readRecentSearches()).toEqual([]);

    stubStorage({ [WEB_STORAGE_KEYS.recentSearches]: "{not json" });
    expect(readRecentSearches()).toEqual([]);

    stubStorage({ [WEB_STORAGE_KEYS.recentSearches]: '{"tv":1}' });
    expect(readRecentSearches()).toEqual([]);

    stubStorage({ [WEB_STORAGE_KEYS.recentSearches]: '["tv",3,null]' });
    expect(readRecentSearches()).toEqual(["tv"]);
  });

  it("gives an empty list and does not throw when storage is blocked", () => {
    const blocked = () => {
      throw new DOMException("denied", "SecurityError");
    };
    vi.stubGlobal("localStorage", { getItem: blocked, setItem: blocked });

    expect(readRecentSearches()).toEqual([]);
    expect(() => writeRecentSearches(["tv"])).not.toThrow();
  });
});
