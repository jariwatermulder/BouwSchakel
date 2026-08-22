/**
 * Seed-script (development).
 *
 * Belangrijk: seed data mag NOOIT in productie terechtkomen. Dit script weigert
 * te draaien wanneer NODE_ENV === "production". Realistische NL-seed (ZZP'ers,
 * bedrijven, opdrachten, matches, reviews) wordt in FASE 2+ uitgebreid; records
 * worden duidelijk als seed gemarkeerd. Zie docs/IMPLEMENTATION_PLAN.md.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed wordt niet uitgevoerd in productie.");
  }

  console.info("Seed: FASE 1 heeft nog geen seed data. Uitgebreid in FASE 2+.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
