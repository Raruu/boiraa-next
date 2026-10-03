import { QueueRepository } from "@/server/repositories/queue/queue.repository";
import { QueueService } from "@/server/services/queue/queue.service";
import type { QueueJobType } from "@/server/services/queue/queue.service";

const repo = new QueueRepository();
const INTERVAL_MS = 60 * 1000; // 1 minute
const STUCK_THRESHOLD_MS = 120 * 1000; // 2 minutes

let started = false;

/**
 * Recovery poller — safety net for jobs that were written to the DB but never
 * made it into Redis (Redis was down at dispatch, process crashed mid-add).
 * Scans "pending" jobs older than the threshold and re-dispatches them,
 * marking them "failed" once maxAttempts is reached.
 */
export function startQueueRecoveryPoller() {
  if (started) return;
  started = true;

  console.log("[QueueRecovery] Poller started (every 1 min, threshold 2 min)");

  setInterval(async () => {
    try {
      const stuckJobs = await repo.findPendingJobs(STUCK_THRESHOLD_MS, 20);
      if (stuckJobs.length === 0) return;

      console.log(
        `[QueueRecovery] Found ${stuckJobs.length} stuck job(s), re-dispatching...`,
      );

      for (const job of stuckJobs) {
        try {
          const payload = job.payload as Record<string, unknown>;
          const reDispatched = await QueueService.reDispatch(
            job.id,
            payload,
            job.type as QueueJobType,
            job.maxAttempts,
            job.attempts,
          );

          console.log(
            reDispatched
              ? `[QueueRecovery] Re-dispatched job ${job.id} (attempt ${job.attempts + 1}/${job.maxAttempts})`
              : `[QueueRecovery] Marked job ${job.id} as failed (max attempts reached)`,
          );
        } catch (err) {
          console.error(
            `[QueueRecovery] Failed to re-dispatch job ${job.id}:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    } catch (err) {
      console.error(
        "[QueueRecovery] Poller error:",
        err instanceof Error ? err.message : err,
      );
    }
  }, INTERVAL_MS);
}
