import { BaseRepository } from "@/server/repositories/base.repository";
import type { QueueJob } from "@/generated/prisma/client";

export class QueueRepository extends BaseRepository<QueueJob> {
  protected modelName = "queueJob";

  /* Pending jobs older than threshold — used by the recovery poller */
  async findPendingJobs(
    olderThanMs = 120_000,
    limit = 10,
  ): Promise<QueueJob[]> {
    const cutoff = new Date(Date.now() - olderThanMs);
    return this.model.findMany({
      where: { status: "pending", createdAt: { lt: cutoff } },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async incrementAttempts(id: string): Promise<QueueJob> {
    return this.model.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }

  async markCompleted(id: string): Promise<QueueJob> {
    return this.model.update({
      where: { id },
      data: { status: "completed", processedAt: new Date() },
    });
  }

  /* currentAttempts >= maxAttempts → terminal "failed", otherwise back to "pending" for retry */
  async markFailed(
    id: string,
    error: string,
    maxAttempts: number,
    currentAttempts: number,
  ): Promise<QueueJob> {
    const status = currentAttempts >= maxAttempts ? "failed" : "pending";
    return this.model.update({
      where: { id },
      data: { status, error },
    });
  }
}
