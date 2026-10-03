import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma v7 configuration.
 *
 * In v7 the CLI reads the database URL from this file, NOT from
 * `datasource.url` in schema.prisma — that field was removed.
 *
 * The placeholder fallback matters: `prisma generate` runs on `npm install`
 * and in CI before `.env` exists, and `env("DATABASE_URL")` would hard-fail
 * there. Generate only needs a syntactically valid URL; migrations and the
 * app still require a real DATABASE_URL.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
