import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads in development to avoid
// exhausting the database connection pool.
//
// NOTE: This module imports @prisma/client and must NEVER be imported from
// middleware.ts (the Edge runtime cannot load Prisma). Middleware uses only the
// Edge-safe session helpers in src/lib/auth/session.ts.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
