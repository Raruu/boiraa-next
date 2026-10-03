/**
 * Next.js instrumentation hook — runs once on server startup (Node runtime only).
 *
 * Workers and the recovery poller are only booted when QUEUE_ENABLED=true.
 * With the queue disabled (the default) nothing here touches Redis, so there
 * is no reconnect spam when Redis is absent.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { QUEUE_ENABLED } = await import("./lib/queue-config");
  if (!QUEUE_ENABLED) return;

  const { initWorkers } = await import("./lib/worker-init");
  initWorkers();

  const { startQueueRecoveryPoller } = await import("./lib/queue-recovery");
  startQueueRecoveryPoller();
}
