import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

/**
 * Seed script — run with `npm run db:seed`.
 *
 * In Prisma v7 seeding is no longer automatic after `migrate dev`; the command
 * above is wired in `prisma.config.ts` (`migrations.seed`).
 */
const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://placeholder:placeholder@localhost:5432/placeholder",
});
const prisma = new PrismaClient({ adapter });

const ROLES = [
  { code: "ADMIN", name: "Administrator" },
  { code: "MENTOR", name: "Mentor" },
  { code: "PESERTA", name: "Peserta" },
];

async function main() {
  const roleRecords = await Promise.all(
    ROLES.map((role) =>
      prisma.role.upsert({
        where: { code: role.code },
        update: { name: role.name },
        create: role,
      }),
    ),
  );

  const adminRole = roleRecords.find((role) => role.code === "ADMIN");
  if (!adminRole) throw new Error("ADMIN role was not seeded");

  const password = await bcrypt.hash(
    process.env.AUTH_DEMO_PASSWORD || "password",
    10,
  );

  await prisma.user.upsert({
    where: { email: process.env.AUTH_DEMO_EMAIL || "admin@demo.com" },
    update: {},
    create: {
      email: process.env.AUTH_DEMO_EMAIL || "admin@demo.com",
      password,
      fullname: "Demo Admin",
      roleId: adminRole.id,
    },
  });

  console.log("Seed complete: roles + demo admin ready.");
}

main()
  .catch((err) => {
    console.error("[prisma/seed]", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
