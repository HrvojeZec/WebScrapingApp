import type { Clock } from "./clock";

export type HostQueue = {
  /** Resolves when the next request to this origin may start. */
  waitTurn(origin: string, signal?: AbortSignal): Promise<void>;
  pauseUntil(origin: string, atMs: number): void;
};

export function createHostQueue(clock: Clock, minIntervalMs: number): HostQueue {
  const nextStartAt = new Map<string, number>();
  const pausedUntil = new Map<string, number>();

  return {
    async waitTurn(origin, signal) {
      for (;;) {
        signal?.throwIfAborted();
        // The slot is taken before sleeping, so concurrent callers line up instead of starting together
        const startAt = Math.max(
          clock.now(),
          nextStartAt.get(origin) ?? 0,
          pausedUntil.get(origin) ?? 0,
        );
        nextStartAt.set(origin, startAt + minIntervalMs);
        const wait = startAt - clock.now();
        if (wait > 0) await clock.sleep(wait, signal);
        // A 429 that arrived while this caller slept pauses it too
        if ((pausedUntil.get(origin) ?? 0) <= clock.now()) return;
      }
    },
    pauseUntil(origin, atMs) {
      pausedUntil.set(origin, Math.max(pausedUntil.get(origin) ?? 0, atMs));
    },
  };
}
