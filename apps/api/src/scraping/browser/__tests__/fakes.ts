import type { Clock } from "../../http/clock";
import type { BrowserPort, MainResponse, PagePort, PageSetup } from "../ports";

/** How one fake page behaves; everything left out is a 200 whose cards appear at once. */
export type FakePage = {
  /** What `goto` gives: a response, `null`, an error to throw, or "hang" (never settles) */
  response?: Partial<MainResponse> | null | Error | "hang";
  /** false: the selector never appears */
  selectorAppears?: boolean;
  /** Card counts in turn; the last one repeats */
  counts?: number[];
  /** A stuck renderer: `count` and `content` never answer */
  hangs?: boolean;
  html?: string;
};

/** Everything the source asks of the gate and the browser, in order, with the fake time. */
export type Event = { at: number; call: string; arg?: string };

export function createFakeGate(
  clock: Clock,
  events: Event[],
  allowed: (url: string) => boolean = () => true,
) {
  const pauses: { origin: string; untilMs: number }[] = [];
  return {
    pauses,
    gate: {
      isAllowed(url: string) {
        events.push({ at: clock.now(), call: "isAllowed", arg: url });
        return Promise.resolve(allowed(url));
      },
      waitTurn(origin: string) {
        events.push({ at: clock.now(), call: "waitTurn", arg: origin });
        return Promise.resolve();
      },
      pause(origin: string, untilMs: number) {
        pauses.push({ origin, untilMs });
      },
    },
  };
}

/**
 * A launcher whose browsers serve `pages` in turn, one per `newPage`. `crashOnNewPage` makes the
 * browser of that launch (1-based) throw in `newPage`.
 */
export function createFakeLauncher(
  clock: Clock,
  events: Event[],
  pages: FakePage[],
  { crashOnNewPage, closeHangs }: { crashOnNewPage?: number; closeHangs?: boolean } = {},
) {
  const setups: PageSetup[] = [];
  const browsers: { connected: boolean; closed: boolean }[] = [];
  const pagesClosed: boolean[] = [];
  let next = 0;

  function fakePage(spec: FakePage, index: number): PagePort {
    let countCall = 0;
    return {
      goto(url) {
        events.push({ at: clock.now(), call: "goto", arg: url });
        const response = spec.response;
        if (response === "hang") return new Promise(() => {});
        if (response instanceof Error) return Promise.reject(response);
        if (response === null) return Promise.resolve(null);
        return Promise.resolve({ status: 200, url, headers: {}, ...response });
      },
      waitForSelector(selector) {
        events.push({ at: clock.now(), call: "waitForSelector", arg: selector });
        return Promise.resolve(spec.selectorAppears ?? true);
      },
      count(selector) {
        events.push({ at: clock.now(), call: "count", arg: selector });
        if (spec.hangs) return new Promise(() => {});
        const counts = spec.counts ?? [1];
        const value = counts[Math.min(countCall, counts.length - 1)];
        countCall += 1;
        return Promise.resolve(value);
      },
      content() {
        events.push({ at: clock.now(), call: "content" });
        if (spec.hangs) return new Promise(() => {});
        return Promise.resolve(spec.html ?? "<main>cards</main>");
      },
      close() {
        events.push({ at: clock.now(), call: "closePage" });
        pagesClosed[index] = true;
        return Promise.resolve();
      },
    };
  }

  async function launch(): Promise<BrowserPort> {
    events.push({ at: clock.now(), call: "launch" });
    const state = { connected: true, closed: false };
    browsers.push(state);
    const launchNumber = browsers.length;
    return {
      connected: () => state.connected,
      newPage(setup) {
        events.push({ at: clock.now(), call: "newPage" });
        if (crashOnNewPage === launchNumber) {
          state.connected = false;
          return Promise.reject(new Error("Target closed"));
        }
        setups.push(setup);
        const index = next;
        next += 1;
        pagesClosed[index] = false;
        return Promise.resolve(fakePage(pages[Math.min(index, pages.length - 1)], index));
      },
      close() {
        events.push({ at: clock.now(), call: "closeBrowser" });
        state.closed = true;
        state.connected = false;
        return closeHangs ? new Promise(() => {}) : Promise.resolve();
      },
    };
  }

  return { launch, setups, browsers, pagesClosed };
}

export function timeoutError(message = "Navigation timeout of 30000 ms exceeded"): Error {
  const error = new Error(message);
  error.name = "TimeoutError";
  return error;
}
