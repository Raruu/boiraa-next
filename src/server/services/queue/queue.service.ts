import type { Queue } from "bullmq";
import { createRedis } from "@/lib/redis";
import { QUEUE_ENABLED } from "@/lib/queue-config";
import { QueueRepository } from "@/server/repositories/queue/queue.repository";
import {
  EmailService,
  type EmailAttachment,
} from "@/server/services/email/email.service";

const queueRepo = new QueueRepository();

export type QueueJobType = "send_email";

export type QueuePayload = {
  send_email: {
    to: string;
    subject: string;
    /** template key registered in server/services/email/templates/index.ts */
    template: string;
    data: Record<string, unknown>;
    attachments?: EmailAttachment[];
  };
};

const DEFAULT_JOB_OPTS = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 5000 },
  removeOnComplete: true,
  removeOnFail: false,
};

/**
 * Lazily create the BullMQ queue — only when QUEUE_ENABLED. Importing this
 * module with the queue disabled must not open a Redis connection.
 */
let emailQueue: Queue | null = null;
async function getEmailQueue(): Promise<Queue> {
  if (!emailQueue) {
    const { Queue } = await import("bullmq");
    emailQueue = new Queue("email", { connection: createRedis() });
  }
  return emailQueue;
}

/** Run a job's actual work in-process (used when QUEUE_ENABLED=false). */
async function runInline<T extends QueueJobType>(
  type: T,
  payload: QueuePayload[T],
) {
  if (type === "send_email") {
    await EmailService.send(payload as QueuePayload["send_email"]);
  }
}

export class QueueService {
  /**
   * Dispatch a job.
   *
   * QUEUE_ENABLED=false → write the DB audit row, run the work inline, mark the
   * row completed/failed. The caller awaits the actual work (e.g. SMTP send).
   *
   * QUEUE_ENABLED=true → write the DB audit row (source of truth), then push to
   * Redis. jobId is deterministic so double-clicks don't enqueue twice. If
   * Redis is unreachable the row stays "pending" and the recovery poller
   * retries it.
   */
  static async dispatch<T extends QueueJobType>(
    type: T,
    payload: QueuePayload[T],
  ) {
    const dbJob = await queueRepo.create({
      type,
      payload: payload as unknown as Record<string, unknown>,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
    });

    if (!QUEUE_ENABLED) {
      try {
        await runInline(type, payload);
        await queueRepo.markCompleted(dbJob.id);
      } catch (err) {
        await queueRepo
          .markFailed(
            dbJob.id,
            err instanceof Error ? err.message : String(err),
            3,
            3,
          )
          .catch(() => {});
        throw err;
      }
      return dbJob;
    }

    try {
      const queue = await getEmailQueue();
      await queue.add(
        type,
        { ...payload, dbJobId: dbJob.id },
        { jobId: `${type}_${dbJob.id}`, ...DEFAULT_JOB_OPTS },
      );
    } catch (redisErr) {
      await QueueService.markFailed(
        dbJob.id,
        `Redis dispatch failed: ${redisErr instanceof Error ? redisErr.message : String(redisErr)}`,
        3,
        3,
      ).catch(() => {});
      throw redisErr;
    }

    return dbJob;
  }

  /**
   * Same as dispatch but the job only runs after delayMs.
   * With the queue disabled this falls back to an in-process setTimeout —
   * fine for local dev, but a real delayed-job guarantee needs QUEUE_ENABLED=true.
   */
  static async dispatchDelayed<T extends QueueJobType>(
    type: T,
    payload: QueuePayload[T],
    delayMs: number,
  ) {
    const dbJob = await queueRepo.create({
      type,
      payload: payload as unknown as Record<string, unknown>,
      status: "pending",
      attempts: 0,
      maxAttempts: 3,
    });

    if (!QUEUE_ENABLED) {
      setTimeout(() => {
        void runInline(type, payload)
          .then(() => queueRepo.markCompleted(dbJob.id))
          .catch((err) =>
            queueRepo
              .markFailed(
                dbJob.id,
                err instanceof Error ? err.message : String(err),
                3,
                3,
              )
              .catch(() => {}),
          );
      }, delayMs);
      return dbJob;
    }

    try {
      const queue = await getEmailQueue();
      await queue.add(
        type,
        { ...payload, dbJobId: dbJob.id },
        { jobId: `${type}_${dbJob.id}`, delay: delayMs, ...DEFAULT_JOB_OPTS },
      );
    } catch (redisErr) {
      await QueueService.markFailed(
        dbJob.id,
        `Redis dispatch failed: ${redisErr instanceof Error ? redisErr.message : String(redisErr)}`,
        3,
        3,
      ).catch(() => {});
      throw redisErr;
    }

    return dbJob;
  }

  static async markCompleted(dbJobId: string) {
    return queueRepo.markCompleted(dbJobId);
  }

  static async markFailed(
    dbJobId: string,
    error: string,
    maxAttempts: number,
    currentAttempts: number,
  ) {
    return queueRepo.markFailed(dbJobId, error, maxAttempts, currentAttempts);
  }

  /** Re-push a stuck DB job to Redis. Called by the recovery poller only. */
  static async reDispatch(
    dbJobId: string,
    payload: Record<string, unknown>,
    type: QueueJobType,
    maxAttempts: number,
    currentAttempts: number,
  ) {
    if (currentAttempts >= maxAttempts) {
      await queueRepo.markFailed(
        dbJobId,
        "Max re-dispatch attempts reached",
        maxAttempts,
        currentAttempts,
      );
      return false;
    }

    await queueRepo.incrementAttempts(dbJobId);
    const queue = await getEmailQueue();
    await queue.add(
      type,
      { ...payload, dbJobId },
      {
        jobId: `${type}_${dbJobId}_${currentAttempts + 1}`,
        ...DEFAULT_JOB_OPTS,
      },
    );

    return true;
  }
}
