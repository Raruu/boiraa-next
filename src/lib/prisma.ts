import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma v7 client with the PostgreSQL driver adapter.
 *
 * v7 requires a driver adapter — the Rust query engine is gone. The adapter
 * also owns the connection pool, so pool tuning happens on `pg`, not Prisma.
 *
 * Always import this singleton. Never construct a new PrismaClient: each
 * instance opens its own pool and dev hot-reload would exhaust connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "",
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
