/**
 * Master switch for the Redis-backed queue + background workers.
 *
 * QUEUE_ENABLED=false (default): no Redis connection is ever opened. Jobs are
 * processed inline, synchronously, in the request that dispatched them.
 * The boilerplate runs with zero infra.
 *
 * QUEUE_ENABLED=true: jobs go through BullMQ/Redis, a worker consumes them in
 * the background, and the recovery poller re-dispatches stuck jobs. Requires a
 * reachable REDIS_URL.
 */
export const QUEUE_ENABLED = process.env.QUEUE_ENABLED === "true";
