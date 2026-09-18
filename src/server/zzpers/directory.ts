import "server-only";
import { db } from "@/lib/db";

/**
 * Publieke etalage van zichtbare zzp'ers. Bedrijven kunnen bladeren en direct
 * contact opnemen — er is geen opdracht nodig. Toont alleen profielen met
 * `zichtbaar = true`. Privacy: geen exacte contactgegevens in de etalage.
 */

export type DirectoryFilter = { vakSlug?: string; plaats?: string };

export async function listVakgebiedenVoorFilter() {
  return db.skill.findMany({
    select: { naam: true, slug: true },
    orderBy: { naam: "asc" },
  });
}

export async function listPublicZzpers(filter: DirectoryFilter) {
  return db.zZPProfile.findMany({
    where: {
      zichtbaar: true,
      deletedAt: null,
      ...(filter.vakSlug
        ? { skills: { some: { skill: { slug: filter.vakSlug } } } }
        : {}),
      ...(filter.plaats
        ? { werkgebiedPlaats: { contains: filter.plaats, mode: "insensitive" } }
        : {}),
    },
    include: { skills: { include: { skill: true } } },
    orderBy: [{ verificatieStatus: "desc" }, { updatedAt: "desc" }],
    take: 60,
  });
}

/** Aantal zichtbare zzp'er-profielen in de etalage (voor tellers). */
export async function countPublicZzpers(): Promise<number> {
  return db.zZPProfile.count({ where: { zichtbaar: true, deletedAt: null } });
}

export async function getPublicZzper(id: string) {
  const profile = await db.zZPProfile.findFirst({
    where: { id, zichtbaar: true, deletedAt: null },
    include: {
      skills: { include: { skill: true } },
      certifications: { include: { certification: true } },
      portfolio: { orderBy: { volgorde: "asc" } },
    },
  });
  return profile;
}

/** Privacy-vriendelijke weergavenaam: bedrijfsnaam of voornaam + initiaal. */
export function displayNaam(p: {
  bedrijfsnaam: string | null;
  voornaam: string | null;
  achternaam: string | null;
}): string {
  if (p.bedrijfsnaam?.trim()) return p.bedrijfsnaam.trim();
  const voor = p.voornaam?.trim() ?? "";
  const initiaal = p.achternaam?.trim()?.[0];
  return [voor, initiaal ? `${initiaal}.` : ""].filter(Boolean).join(" ") || "ZZP’er";
}
