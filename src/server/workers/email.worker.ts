import { Worker } from "bullmq";
import { createRedis } from "@/lib/redis";
import { EmailService } from "@/server/services/email/email.service";
import { QueueService } from "@/server/services/queue/queue.service";

/**
 * Email worker — consumes "send_email" jobs from the Redis queue.
 *
 * Ordering matters: send the email FIRST, then update the DB log. If the email
 * send succeeds we must NOT let a DB error bubble up, otherwise BullMQ retries
 * the job and the recipient gets a duplicate. Only a real send failure
 * (SMTP reject, network error) is allowed to throw and trigger a retry.
 */
export const emailWorker = new Worker(
  "email",
  async (job) => {
    const { to, subject, template, data, attachments, dbJobId } = job.data;

    await EmailService.send({ to, subject, template, data, attachments });

    try {
      if (dbJobId) await QueueService.markCompleted(dbJobId);
    } catch (dbErr) {
      console.error(
        `[EmailWorker] markCompleted failed for ${dbJobId}:`,
        dbErr instanceof Error ? dbErr.message : dbErr,
      );
    }
  },
  {
    connection: createRedis(),
    concurrency: 5,
  },
);

emailWorker.on("failed", async (job, err) => {
  console.error(`[EmailWorker] Job ${job?.id} failed:`, err.message);
  if (!job) return;
  const { dbJobId } = job.data;
  if (!dbJobId) return;
  try {
    await QueueService.markFailed(
      dbJobId,
      err.message,
      job.opts.attempts ?? 3,
      job.attemptsMade,
    );
  } catch (dbErr) {
    console.error(
      `[EmailWorker] markFailed failed for ${dbJobId}:`,
      dbErr instanceof Error ? dbErr.message : dbErr,
    );
  }
});

emailWorker.on("error", (err) => {
  console.error("[EmailWorker] Worker connection error:", err.message);
});
