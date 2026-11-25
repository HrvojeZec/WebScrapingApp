import { API_ERROR_CODES, type ApiErrorBody, type ApiErrorCode } from "@storeseeker/shared";
import { HTTP_STATUS } from "./http-status";

/** `network`: no response at all; `unavailable`: a response that is not the API's JSON. */
export type ApiErrorKind = ApiErrorCode | "network" | "unavailable";

/** A failed API call. `message` is shown to the user only for the API's own codes. */
export class ApiError extends Error {
  readonly code: ApiErrorKind;
  readonly status: number | null;
  readonly resetAt: string | null;

  constructor(code: ApiErrorKind, message: string, status: number | null, resetAt?: string | null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.resetAt = resetAt ?? null;
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const JSON_TYPE = "application/json";
const NOT_JSON = Symbol("not JSON");

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null || !("error" in value)) return false;
  const { error } = value as { error: unknown };
  if (typeof error !== "object" || error === null) return false;
  const { code, message } = error as Record<string, unknown>;
  return typeof message === "string" && (API_ERROR_CODES as readonly unknown[]).includes(code);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return JSON.parse(await response.text());
  } catch {
    return NOT_JSON;
  }
}

async function request<T>(
  method: Method,
  path: string,
  { params, body }: { params?: URLSearchParams; body?: unknown } = {},
): Promise<T> {
  const query = params?.toString();
  const headers = new Headers({ Accept: JSON_TYPE });
  if (body !== undefined) headers.set("Content-Type", JSON_TYPE);

  let response: Response;
  try {
    response = await fetch(query ? `${path}?${query}` : path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // The session cookie of v0.4 rides along on the same origin
      credentials: "same-origin",
    });
  } catch (error) {
    throw new ApiError("network", error instanceof Error ? error.message : String(error), null);
  }

  if (response.status === HTTP_STATUS.noContent) return undefined as T;

  const data = await readJson(response);
  if (response.ok && data !== NOT_JSON) return data as T;
  if (!response.ok && isApiErrorBody(data)) {
    const { code, message, resetAt } = data.error;
    throw new ApiError(code, message, response.status, resetAt);
  }
  // A dead API behind the Vite proxy answers 502 with HTML; a wrong proxy serves index.html
  throw new ApiError(
    "unavailable",
    `Expected JSON from ${path}, got HTTP ${response.status}`,
    response.status,
  );
}

/** The one HTTP client of the web app; every call goes to the same-origin `/api`. */
export const baseApi = {
  get: <T>(path: string, params?: URLSearchParams) => request<T>("GET", path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
