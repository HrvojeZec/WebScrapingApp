import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../test/mongo";
import { Store } from "../models/store";
import { ensureStores, setStoreEnabled } from "../stores";

beforeAll(async () => {
  await connectMemoryMongoDB();
  await Store.syncIndexes();
});
afterEach(clearDatabase);
afterAll(disconnectMemoryMongoDB);

describe("ensureStores", () => {
  test("creates Mall and Big Bang once, however often it runs", async () => {
    await ensureStores();
    await ensureStores();

    const stores = await Store.find().sort({ slug: 1 }).lean();
    expect(stores).toMatchObject([
      {
        slug: "bigbang",
        name: "Big Bang",
        baseUrl: "https://www.bigbang.hr",
        logoPath: "/stores/bigbang.svg",
        enabled: true,
      },
      {
        slug: "mall",
        name: "Mall",
        baseUrl: "https://www.mall.hr",
        logoPath: "/stores/mall.svg",
        enabled: true,
      },
    ]);
  });

  test("keeps a store that was switched off switched off", async () => {
    await ensureStores();
    await setStoreEnabled("bigbang", false);
    await ensureStores();

    const bigbang = await Store.findOne({ slug: "bigbang" }).lean();
    expect(bigbang?.enabled).toBe(false);
  });
});

describe("setStoreEnabled", () => {
  test("switches a store back on", async () => {
    await ensureStores();
    await setStoreEnabled("mall", false);
    await setStoreEnabled("mall", true);

    const mall = await Store.findOne({ slug: "mall" }).lean();
    expect(mall?.enabled).toBe(true);
  });

  test("fails for a store that is not in the database", async () => {
    await expect(setStoreEnabled("mall", false)).rejects.toThrow(/mall/);
  });
});
