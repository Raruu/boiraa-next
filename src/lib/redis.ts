/**
 * Redis connection config for BullMQ (queue + workers).
 * BullMQ accepts an ioredis options object directly, so we don't
 * instantiate a client here — that keeps a single connection per
 * Queue/Worker and avoids duplicate ioredis type imports.
 */
export const redisConnection =
  process.env.REDIS_URL || "redis://localhost:6379";

export const createRedis = () => ({
  url: redisConnection,
  connectTimeout: 5000,
  // BullMQ requires this to be null for blocking commands
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});
