import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";
import {
  findAllKeywords,
  findProductsByKeyword,
  findRandomProducts,
  paginationHandler,
} from "../product-service";
import { connectMemoryMongoDB, clearDatabase, disconnectMemoryMongoDB } from "../../../test/mongo";
import { Product } from "../../../model/productModel";
import { testStoreData, testProductData } from "../../../test/product-data";
import { Stores } from "../../../model/storesModel";

beforeAll(async () => {
  await connectMemoryMongoDB();
});

beforeEach(async () => {
  await Stores.create(testStoreData);
  await Product.create(testProductData);
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnectMemoryMongoDB();
});

describe("findAllkeywords function", () => {
  test("should find all keyword", async () => {
    const keywords = await findAllKeywords();

    expect(keywords).toContain("iphone");
    expect(keywords).toContain("laptop");
  });
});

describe("findProductsByKeyword function", () => {
  test("should return products with store attributes by keyword", async () => {
    const { skip, limit } = await paginationHandler("iphone", 1, 10);
    const products = await findProductsByKeyword("iphone", skip, limit);

    expect(products.length).toBeGreaterThan(0);
    expect(products[0].storeName).toBe("Test Mall");
    expect(products[0]).toHaveProperty("logo");
    expect(products[0].keyword).toBe("iphone");
  });
});

describe("findRandomProducts function", () => {
  test("returns at most 10 distinct random products", async () => {
    const products = await findRandomProducts();

    // The fixture has fewer than 10 products, so all of them come back once
    expect(products.length).toBe(Math.min(10, testProductData.length));
    expect(new Set(products.map((product) => String(product._id))).size).toBe(products.length);
  });
});
