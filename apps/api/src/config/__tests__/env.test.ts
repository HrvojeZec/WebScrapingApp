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
      MONGODB_URI: VALID_URI,
      CLIENT_URL: "http://localhost:5173",
      LOG_LEVEL: "info",
    });
  });

  test("parses numeric ports and rejects invalid ones", () => {
    expect(loadEnv({ MONGODB_URI: VALID_URI, PORT: "8080" }).PORT).toBe(8080);
    expect(() => loadEnv({ MONGODB_URI: VALID_URI, PORT: "abc" })).toThrow(/PORT/);
  });

  test("accepts a pino log level and rejects anything else", () => {
    expect(loadEnv({ MONGODB_URI: VALID_URI, LOG_LEVEL: "silent" }).LOG_LEVEL).toBe("silent");
    expect(() => loadEnv({ MONGODB_URI: VALID_URI, LOG_LEVEL: "verbose" })).toThrow(/LOG_LEVEL/);
  });

  test("ignores the removed executor variables", () => {
    const env = loadEnv({ MONGODB_URI: VALID_URI, PORT_STATUS: "5001", EXECUTE_URL: "x" });
    expect(env).not.toHaveProperty("PORT_STATUS");
    expect(env).not.toHaveProperty("EXECUTE_URL");
  });

  test("starts the error message with a summary line", () => {
    expect(() => loadEnv({})).toThrow(/^Invalid environment variables:\n- MONGODB_URI: /);
  });

  test("treats empty values as missing", () => {
    expect(() => loadEnv({ MONGODB_URI: "" })).toThrow(/MONGODB_URI: is required/);
    expect(loadEnv({ MONGODB_URI: VALID_URI, PORT: "" }).PORT).toBe(5000);
  });

  test("rejects ports outside 1-65535", () => {
    expect(() => loadEnv({ MONGODB_URI: VALID_URI, PORT: "70000" })).toThrow(/PORT/);
  });

  test("MONGODB_DB_NAME is optional and must be a plain database name", () => {
    expect(loadEnv({ MONGODB_URI: VALID_URI }).MONGODB_DB_NAME).toBeUndefined();
    expect(
      loadEnv({ MONGODB_URI: VALID_URI, MONGODB_DB_NAME: "storeseeker-demo" }).MONGODB_DB_NAME,
    ).toBe("storeseeker-demo");
    expect(() => loadEnv({ MONGODB_URI: VALID_URI, MONGODB_DB_NAME: "a/b" })).toThrow(
      /MONGODB_DB_NAME/,
    );
  });

  test("normalizes CLIENT_URL to an origin, because CORS compares it exactly", () => {
    expect(
      loadEnv({ MONGODB_URI: VALID_URI, CLIENT_URL: "http://localhost:5173/" }).CLIENT_URL,
    ).toBe("http://localhost:5173");
  });
});
