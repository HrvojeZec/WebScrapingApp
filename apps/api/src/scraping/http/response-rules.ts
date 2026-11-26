// How a shop's answer is read, the same for the HTTP client and the browser

const DEFAULT_RETRY_AFTER_MS = 60_000;
const MAX_RETRY_AFTER_MS = 3_600_000;

/** Cloudflare's "Just a moment..." page, which can come with a 200 or a 503. */
export function isChallengePage(body: string): boolean {
  return body.includes("Just a moment") && body.includes("cf-chl");
}

/** How long a 429 asks us to wait: seconds or an HTTP date, 60 s without either, at most 1 h. */
export function parseRetryAfter(header: string | null, nowMs: number): number {
  let ms = DEFAULT_RETRY_AFTER_MS;
  if (header && /^\d+$/.test(header.trim())) {
    ms = Number(header.trim()) * 1000;
  } else if (header && /[a-z]/i.test(header) && !Number.isNaN(Date.parse(header))) {
    // An HTTP date always names the weekday and month; Date.parse would also take "-5" as 2001
    ms = Date.parse(header) - nowMs;
  }
  return Math.min(Math.max(ms, 0), MAX_RETRY_AFTER_MS);
}
