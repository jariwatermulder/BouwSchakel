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

export async function getPublicZzper(id: string) {
  const profile = await db.zZPProfile.findFirst({
    where: { id, zichtbaar: true, deletedAt: null },
    include: {
      skills: { include: { skill: true } },
      certifications: { include: { certification: true } },
    },
  });
  if (!profile) return null;

  const reviews = await db.review.findMany({
    where: { overZzpProfileId: id },
    orderBy: { gepubliceerdOp: "desc" },
    take: 20,
  });

  const scores = reviews.map(
    (r) =>
      (r.scoreKwaliteit +
        r.scoreCommunicatie +
        r.scoreBetrouwbaarheid +
        r.scoreAfspraken) /
      4,
  );
  const gemiddelde =
    scores.length > 0 ? scores.reduce((s, n) => s + n, 0) / scores.length : null;

  return { profile, reviews, gemiddelde, aantalReviews: reviews.length };
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
