import { describe, expect, it } from "vitest";
import {
  CustomBadRequest,
  CustomNotFound,
  CustomInternalServerError,
  CustomMultiStatus,
} from "../CustomError";

describe("custom errors", () => {
  it("carry the HTTP status code of their type", () => {
    expect(new CustomBadRequest().statusCode).toBe(400);
    expect(new CustomNotFound().statusCode).toBe(404);
    expect(new CustomInternalServerError().statusCode).toBe(500);
    expect(new CustomMultiStatus().statusCode).toBe(207);
  });
});
