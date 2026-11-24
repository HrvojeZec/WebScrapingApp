import { setTimeout as delay } from "node:timers/promises";

export type Clock = { now(): number; sleep(ms: number, signal?: AbortSignal): Promise<void> };

export const systemClock: Clock = {
  now: () => Date.now(),
  sleep: async (ms, signal) => {
    await delay(ms, undefined, { signal });
  },
};
