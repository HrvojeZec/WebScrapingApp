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
  test("creates Harvey Norman once, however often it runs", async () => {
    await ensureStores();
    await ensureStores();

    const stores = await Store.find().lean();
    expect(stores).toMatchObject([
      {
        slug: "harveynorman",
        name: "Harvey Norman",
        baseUrl: "https://www.harveynorman.hr",
        enabled: true,
      },
    ]);
    expect(stores[0]).not.toHaveProperty("logoPath");
  });

  test("keeps a store that was switched off switched off", async () => {
    await ensureStores();
    await setStoreEnabled("harveynorman", false);
    await ensureStores();

    const store = await Store.findOne({ slug: "harveynorman" }).lean();
    expect(store?.enabled).toBe(false);
  });

  test("saves the stores it is given instead of the shops", async () => {
    await ensureStores([{ slug: "demo-a", name: "Demo A", baseUrl: "https://demo-a.example" }]);

    expect(await Store.find().lean()).toMatchObject([{ slug: "demo-a", enabled: true }]);
  });
});

describe("setStoreEnabled", () => {
  test("switches a store back on", async () => {
    await ensureStores();
    await setStoreEnabled("harveynorman", false);
    await setStoreEnabled("harveynorman", true);

    const store = await Store.findOne({ slug: "harveynorman" }).lean();
    expect(store?.enabled).toBe(true);
  });

  test("fails for a store that is not in the database", async () => {
    await expect(setStoreEnabled("harveynorman", false)).rejects.toThrow(/harveynorman/);
  });
});
