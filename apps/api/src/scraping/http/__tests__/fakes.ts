import type { Clock } from "../clock";

type Timer = { at: number; resolve: () => void };

/**
 * A clock whose time only moves when everything else is waiting on it, so tests run instantly
 * and measure waits exactly.
 */
export function createFakeClock(start = Date.parse("2026-11-24T10:00:00Z")) {
  let now = start;
  let timers: Timer[] = [];

  const clock: Clock = {
    now: () => now,
    sleep(ms, signal) {
      return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(signal.reason);
        const timer: Timer = { at: now + Math.max(0, ms), resolve };
        timers.push(timer);
        signal?.addEventListener(
          "abort",
          () => {
            timers = timers.filter((other) => other !== timer);
            reject(signal.reason);
          },
          { once: true },
        );
      });
    },
  };

  async function settle() {
    // Several macrotask turns: reading a Response body goes through web streams
    for (let i = 0; i < 10; i += 1) await new Promise((resolve) => setImmediate(resolve));
  }

  /** Runs the promise to completion, firing timers in time order whenever nothing else can move. */
  async function run<T>(promise: Promise<T>): Promise<T> {
    let done = false;
    promise.then(
      () => (done = true),
      () => (done = true),
    );
    for (;;) {
      await settle();
      if (done) return promise;
      timers.sort((a, b) => a.at - b.at);
      const next = timers.shift();
      if (!next) throw new Error("the promise waits for something other than the clock");
      now = Math.max(now, next.at);
      next.resolve();
    }
  }

  return {
    clock,
    run,
    advance(ms: number) {
      now += ms;
    },
  };
}

export type FakeCall = { url: string; at: number; headers: Headers };
type Handler = (url: string) => Response | Promise<Response>;

export function createFakeFetch(clock: Clock, handler: Handler) {
  const calls: FakeCall[] = [];
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, at: clock.now(), headers: new Headers(init?.headers) });
    return handler(url);
  }) as typeof fetch;
  return {
    fetch: fetchImpl,
    calls,
    pageCalls: () => calls.filter((call) => !call.url.endsWith("/robots.txt")),
    robotsCalls: () => calls.filter((call) => call.url.endsWith("/robots.txt")),
  };
}

/** Serves robots.txt with the given response (404 by default, which allows everything). */
export function withRobots(page: Handler, robots: Handler = () => status(404)): Handler {
  return (url) => (url.endsWith("/robots.txt") ? robots(url) : page(url));
}

export function html(body: string, init: ResponseInit = {}): Response {
  return new Response(body, { status: 200, ...init });
}

export function status(code: number, headers: Record<string, string> = {}): Response {
  return new Response(null, { status: code, headers });
}

/** A Response built by hand has url ""; fetch sets it to the URL after redirects. */
export function redirectedTo(url: string, response: Response): Response {
  Object.defineProperty(response, "url", { value: url });
  return response;
}

export const never = (): Promise<Response> => new Promise(() => {});
