import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { SuggestionsDto } from "@storeseeker/shared";
import { createApp } from "../../../app";
import { createLogger } from "../../../http/logger";
import { insertProduct, insertStore } from "../../../test/factories";
import { clearDatabase, connectMemoryMongoDB, disconnectMemoryMongoDB } from "../../../test/mongo";

const app = createApp({ clientUrl: "http://localhost:5173", logger: createLogger("silent") });

async function suggest(q: string): Promise<string[]> {
  const res = await request(app).get(`/api/suggestions?q=${encodeURIComponent(q)}`);
  expect(res.status).toBe(200);
  return (res.body as SuggestionsDto).suggestions;
}

describe("GET /api/suggestions", () => {
  beforeAll(connectMemoryMongoDB);
  afterAll(disconnectMemoryMongoDB);
  beforeEach(async () => {
    await clearDatabase();
    await insertStore("demo-a");
    await insertStore("demo-b");
    await insertStore("demo-c", false);
  });

  test("gives at most LIMITS.suggestionsMax titles, one per searchText", async () => {
    for (let model = 1; model <= 10; model += 1) {
      await insertProduct({ title: `Nordtek Model ${String(model).padStart(2, "0")}` });
    }
    await insertProduct({ title: "Nordtek Model 01", storeSlug: "demo-b" });
    await insertProduct({ title: "Nordtek Alfa", available: false });
    await insertProduct({ title: "Nordtek Beta", storeSlug: "demo-c" });
    expect(await suggest("nord")).toEqual([
      "Nordtek Model 01",
      "Nordtek Model 02",
      "Nordtek Model 03",
      "Nordtek Model 04",
      "Nordtek Model 05",
      "Nordtek Model 06",
      "Nordtek Model 07",
      "Nordtek Model 08",
    ]);
  });

  test("follows the relevance order: an earlier match first", async () => {
    await insertProduct({ title: "Futrola za Nordtek" });
    await insertProduct({ title: "Nordtek Zeta" });
    expect(await suggest("Nordtek")).toEqual(["Nordtek Zeta", "Futrola za Nordtek"]);
  });

  test("needs every word and ignores diacritics", async () => {
    await insertProduct({ title: "Slušalice Nordtek Buds" });
    await insertProduct({ title: "Slušalice Vidora" });
    expect(await suggest("slusalice nord")).toEqual(["Slušalice Nordtek Buds"]);
  });

  test("a term of one character gives 400", async () => {
    const res = await request(app).get("/api/suggestions?q=a");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("validation_error");
  });
});
