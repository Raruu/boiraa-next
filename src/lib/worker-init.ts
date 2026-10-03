import { QUEUE_ENABLED } from "@/lib/queue-config";

/**
 * Worker bootstrap — called once at server startup from instrumentation.ts,
 * and only when QUEUE_ENABLED=true. Loads the BullMQ workers and wires
 * graceful shutdown so in-flight jobs finish before the process exits
 * (pm2 reload / SIGTERM).
 */
let initialized = false;

export function initWorkers() {
  if (!QUEUE_ENABLED || initialized || typeof window !== "undefined") return;
  initialized = true;

  const tryInit = (retries = 0) => {
    void import("@/server/workers")
      .then(({ emailWorker }) => {
        console.log("[WorkerInit] Workers started");

        const shutdown = async () => {
          console.log("[WorkerInit] Shutting down workers gracefully...");
          try {
            await emailWorker.close();
            console.log("[WorkerInit] Workers closed");
          } catch (err) {
            console.error(
              "[WorkerInit] Error while closing:",
              err instanceof Error ? err.message : err,
            );
          }
        };

        process.on("SIGTERM", shutdown);
        process.on("SIGINT", shutdown);
      })
      .catch((err) => {
        console.error(
          `[WorkerInit] Failed (attempt ${retries + 1}):`,
          err instanceof Error ? err.message : err,
        );
        if (retries < 3) {
          const delay = 5000 * (retries + 1);
          console.log(`[WorkerInit] Retrying in ${delay / 1000}s...`);
          setTimeout(() => tryInit(retries + 1), delay);
        } else {
          console.error("[WorkerInit] Max retries reached, giving up");
          initialized = false;
        }
      });
  };

  tryInit();
}
