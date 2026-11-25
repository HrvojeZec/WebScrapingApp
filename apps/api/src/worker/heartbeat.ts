import { LIMITS } from "@storeseeker/shared";
import { WorkerStatus } from "../db/models/worker-status";

const WORKER_ID = "worker";

export async function recordHeartbeat(now: Date): Promise<void> {
  await WorkerStatus.updateOne({ _id: WORKER_ID }, { $set: { lastSeenAt: now } }, { upsert: true });
}

/** Online while the last heartbeat is at most LIMITS.workerOfflineAfterMs old. */
export async function workerStatus(
  now: Date,
): Promise<{ online: boolean; lastSeenAt: Date | null }> {
  const status = await WorkerStatus.findById(WORKER_ID).lean();
  if (!status) return { online: false, lastSeenAt: null };
  const online = now.getTime() - status.lastSeenAt.getTime() <= LIMITS.workerOfflineAfterMs;
  return { online, lastSeenAt: status.lastSeenAt };
}
