import { describe, expect, test } from "vitest";
import { loadEnv } from "../env";

const VALID_URI = "mongodb+srv://user:p%40ss@cluster0.abc.mongodb.net/storeseeker";

describe("loadEnv", () => {
  test("throws listing MONGODB_URI when it is missing", () => {
    expect(() => loadEnv({})).toThrow(/MONGODB_URI/);
  });

  test("rejects a non-MongoDB URI", () => {
    expect(() => loadEnv({ MONGODB_URI: "http://example.com" })).toThrow(/MONGODB_URI/);
  });

  test("accepts an SRV URI with a URL-encoded password", () => {
    expect(loadEnv({ MONGODB_URI: VALID_URI }).MONGODB_URI).toBe(VALID_URI);
  });

  test("applies local defaults", () => {
    expect(loadEnv({ MONGODB_URI: VALID_URI })).toEqual({
      NODE_ENV: "development",
      PORT: 5000,
      PORT_STATUS: 5001,
      MONGODB_URI: VALID_URI,
      CLIENT_URL: "http://localhost:5173",
      EXECUTE_URL: "http://127.0.0.1:5001/api/execute",
    });
  });

  test("parses numeric ports and rejects invalid ones", () => {
    expect(loadEnv({ MONGODB_URI: VALID_URI, PORT: "8080" }).PORT).toBe(8080);
    expect(() => loadEnv({ MONGODB_URI: VALID_URI, PORT: "abc" })).toThrow(/PORT/);
  });

  test("derives the executor URL from PORT_STATUS", () => {
    expect(loadEnv({ MONGODB_URI: VALID_URI, PORT_STATUS: "6001" }).EXECUTE_URL).toBe(
      "http://127.0.0.1:6001/api/execute",
    );
  });

  test("starts the error message with a summary line", () => {
    expect(() => loadEnv({})).toThrow(/^Invalid environment variables:\n- MONGODB_URI: /);
  });
});
