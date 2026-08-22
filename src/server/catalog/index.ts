import "server-only";
import type { Certification, Skill, Specialization } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Catalogus van vakgebieden, specialisaties en certificaten.
 * Beheerbaar via admin (FASE 7) zonder codewijziging; hier read-only helpers.
 */
export async function listSkills(): Promise<Skill[]> {
  return db.skill.findMany({
    where: { actief: true },
    orderBy: { naam: "asc" },
  });
}

export async function listSpecializations(
  skillIds?: string[],
): Promise<Specialization[]> {
  return db.specialization.findMany({
    where: {
      actief: true,
      ...(skillIds && skillIds.length > 0 ? { skillId: { in: skillIds } } : {}),
    },
    orderBy: { naam: "asc" },
  });
}

export async function listCertifications(): Promise<Certification[]> {
  return db.certification.findMany({
    where: { actief: true },
    orderBy: { naam: "asc" },
  });
}
