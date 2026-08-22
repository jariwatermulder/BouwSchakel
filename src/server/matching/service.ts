import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { geocodeNL } from "@/lib/geo";
import {
  scoreMatch,
  type MatchJobInput,
  type MatchResult,
  type MatchZzpInput,
} from "@/server/matching/engine";
import { getMatchingConfig } from "@/server/matching/settings";

const jobInclude = {
  requirements: true,
  skill: true,
  specialization: true,
  company: true,
} satisfies Prisma.JobInclude;

type JobForMatch = Prisma.JobGetPayload<{ include: typeof jobInclude }>;

const zzpInclude = {
  skills: true,
  specializations: true,
  certifications: true,
  availability: true,
} satisfies Prisma.ZZPProfileInclude;

type ZzpForMatch = Prisma.ZZPProfileGetPayload<{ include: typeof zzpInclude }>;

function toJobInput(job: JobForMatch): MatchJobInput {
  const geo =
    job.lat != null && job.lng != null
      ? { lat: job.lat, lng: job.lng }
      : geocodeNL(job.locatiePlaats);
  return {
    skillId: job.skillId,
    specializationIds: job.specializationId ? [job.specializationId] : [],
    hardCertificationIds: job.requirements
      .filter((r) => r.hard && r.certificationId)
      .map((r) => r.certificationId as string),
    startdatum: job.startdatum,
    einddatum: job.einddatum,
    gewenstUurtariefCents: job.gewenstUurtariefCents,
    eigenGereedschapGewenst: job.eigenGereedschapGewenst,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
  };
}

function toZzpInput(zzp: ZzpForMatch): MatchZzpInput {
  const geo =
    zzp.werkgebiedLat != null && zzp.werkgebiedLng != null
      ? { lat: zzp.werkgebiedLat, lng: zzp.werkgebiedLng }
      : zzp.werkgebiedPlaats
        ? geocodeNL(zzp.werkgebiedPlaats)
        : null;
  return {
    skillIds: zzp.skills.map((s) => s.skillId),
    specializationIds: zzp.specializations.map((s) => s.specializationId),
    certificationIds: zzp.certifications.map((c) => c.certificationId),
    uurtariefCents: zzp.uurtariefCents,
    jarenErvaring: zzp.jarenErvaring,
    maxReisafstandKm: zzp.maxReisafstandKm,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    availability: zzp.availability.map((a) => ({ van: a.van, tot: a.tot })),
    startdatum: zzp.startdatum,
    profielCompleetheidPct: zzp.profielCompleetheidPct,
    reviewGemiddelde: null, // reviews volgen in FASE 6
    afgerondeOpdrachten: 0, // assignments volgen in FASE 5
    eigenBus: zzp.eigenBus,
    eigenGereedschap: zzp.eigenGereedschap,
  };
}

export interface KandidaatMatch {
  zzpProfileId: string;
  naam: string;
  plaats: string | null;
  uurtariefCents: number | null;
  jarenErvaring: number | null;
  verificatieStatus: ZzpForMatch["verificatieStatus"];
  result: MatchResult;
}

/** Beste kandidaten voor een opdracht, gesorteerd op matchscore. */
export async function findKandidatenVoorOpdracht(
  job: JobForMatch,
): Promise<KandidaatMatch[]> {
  const config = await getMatchingConfig();
  // Kandidaatselectie: zichtbare profielen met het juiste vakgebied.
  const kandidaten = await db.zZPProfile.findMany({
    where: {
      zichtbaar: true,
      deletedAt: null,
      skills: { some: { skillId: job.skillId } },
    },
    include: zzpInclude,
  });

  const jobInput = toJobInput(job);

  return kandidaten
    .map((zzp) => {
      const result = scoreMatch(jobInput, toZzpInput(zzp), config.weights, {
        maxAfstandKm: config.maxAfstandKm,
      });
      return { zzp, result };
    })
    .filter((x) => !x.result.uitgesloten)
    .sort((a, b) => b.result.score - a.result.score)
    .map(({ zzp, result }) => ({
      zzpProfileId: zzp.id,
      naam:
        [zzp.voornaam, zzp.achternaam].filter(Boolean).join(" ") ||
        "Vakman zonder naam",
      plaats: zzp.werkgebiedPlaats,
      uurtariefCents: zzp.uurtariefCents,
      jarenErvaring: zzp.jarenErvaring,
      verificatieStatus: zzp.verificatieStatus,
      result,
    }));
}

export interface OpdrachtMatch {
  job: JobForMatch;
  result: MatchResult;
}

/** Berekent de match tussen een ZZP'er en één specifieke opdracht. */
export async function scoreOpdrachtVoorZzp(
  userId: string,
  job: JobForMatch,
): Promise<MatchResult | null> {
  const zzp = await db.zZPProfile.findUnique({
    where: { userId },
    include: zzpInclude,
  });
  if (!zzp) return null;
  const config = await getMatchingConfig();
  return scoreMatch(toJobInput(job), toZzpInput(zzp), config.weights, {
    maxAfstandKm: config.maxAfstandKm,
  });
}

/** Passende, gepubliceerde opdrachten voor een ZZP'er, gesorteerd op score. */
export async function findOpdrachtenVoorZzp(
  userId: string,
): Promise<OpdrachtMatch[]> {
  const zzp = await db.zZPProfile.findUnique({
    where: { userId },
    include: zzpInclude,
  });
  if (!zzp || zzp.skills.length === 0) return [];

  const config = await getMatchingConfig();
  const jobs = await db.job.findMany({
    where: {
      status: "GEPUBLICEERD",
      deletedAt: null,
      skillId: { in: zzp.skills.map((s) => s.skillId) },
    },
    include: jobInclude,
  });

  const zzpInput = toZzpInput(zzp);

  return jobs
    .map((job) => ({
      job,
      result: scoreMatch(toJobInput(job), zzpInput, config.weights, {
        maxAfstandKm: config.maxAfstandKm,
      }),
    }))
    .filter(
      (x) => !x.result.uitgesloten && x.result.score >= config.minMatchScore,
    )
    .sort((a, b) => b.result.score - a.result.score);
}
