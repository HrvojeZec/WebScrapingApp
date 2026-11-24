import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { connectMemoryMongoDB, disconnectMemoryMongoDB, clearDatabase } from "../../../test/mongo";
import { createStoreData } from "../stores-service";
import { Stores } from "../../../model/storesModel";
import { StoresData } from "../../../bootstrap/setup";

beforeAll(async () => {
  await connectMemoryMongoDB();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectMemoryMongoDB();
});

describe("createStoreData", () => {
  test("should add new stores to database", async () => {
    await createStoreData();

    const storesInDb = await Stores.find();
    expect(storesInDb.length).toBe(StoresData.length);
    expect(storesInDb.map((store) => store.storeName)).toEqual(
      StoresData.map((store) => store.storeName),
    );
  });

  test("should not add new store in database if already exists", async () => {
    await Stores.insertMany(StoresData);
    await createStoreData();

    const storesInDb = await Stores.find();
    expect(storesInDb.length).toEqual(StoresData.length);
  });

  test("only those stores that are not in the database sholud be added", async () => {
    await Stores.insertMany({ storeName: "Mall", logo: null });
    await createStoreData();

    const storesInDb = await Stores.find();
    expect(storesInDb.length).toEqual(StoresData.length);
    expect(storesInDb.some((store) => store.storeName === "Sancta Domenica")).toBe(true);
  });
});
