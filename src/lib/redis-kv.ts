import Redis from "ioredis";
import { redisConnection } from "@/lib/redis";

/**
 * Small KV helpers on top of ioredis for case-by-case reads/writes
 * (dedup keys, feature flags, short-lived caches).
 * A fresh client is created per call (lazyConnect) and disconnected in a
 * finally block so it stays safe for serverless / hot-reload environments.
 * For queue work use BullMQ via QueueService — not these helpers.
 */

async function withClient<T>(fn: (client: Redis) => Promise<T>): Promise<T> {
  const client = new Redis(redisConnection, {
    connectTimeout: 5000,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    lazyConnect: true,
  });
  try {
    await client.connect();
    return await fn(client);
  } finally {
    client.disconnect();
  }
}

export async function getRedisValue(key: string): Promise<string | null> {
  return withClient(async (client) => (await client.get(key)) ?? null);
}

export async function setRedisValue(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  await withClient(async (client) => {
    if (ttlSeconds) await client.set(key, value, "EX", ttlSeconds);
    else await client.set(key, value);
  });
}

export async function deleteRedisValue(key: string): Promise<void> {
  await withClient(async (client) => {
    await client.del(key);
  });
}
