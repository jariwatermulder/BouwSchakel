import { PrismaClient } from "@prisma/client";

/**
 * Prisma client als singleton. In development voorkomt de globale cache dat
 * hot-reload steeds nieuwe connecties opent. Prisma verbindt lui: het importeren
 * van deze module opent geen databaseverbinding, dus dit is veilig in
 * server components en tijdens build.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
