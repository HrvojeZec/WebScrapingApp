import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api/base-api";
import { apiErrorMessage } from "../api-error-message";

const SERVER_DOWN =
  "Poslužitelj trenutno ne odgovara. Provjeri je li API pokrenut i pokušaj ponovo.";

describe("apiErrorMessage", () => {
  it("says the server is not answering for a network failure and an unavailable API", () => {
    expect(apiErrorMessage(new ApiError("network", "Failed to fetch", null))).toBe(SERVER_DOWN);
    expect(apiErrorMessage(new ApiError("unavailable", "Bad Gateway", 502))).toBe(SERVER_DOWN);
  });

  it("shows the message of an API error", () => {
    expect(apiErrorMessage(new ApiError("not_found", "Proizvod ne postoji.", 404))).toBe(
      "Proizvod ne postoji.",
    );
  });

  it("gives a general message for an unknown error, never its internal text", () => {
    const message = apiErrorMessage(new Error("Cannot read properties of undefined"));

    expect(message).not.toContain("undefined");
    expect(message).toMatch(/pokušaj ponovo/i);
    expect(apiErrorMessage("boom")).toBe(message);
  });
});
