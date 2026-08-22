import "server-only";
import type { Job, JobStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { slugWithSuffix } from "@/lib/slug";
import { getMembership } from "@/server/company/service";

export class GeenToegangTotOpdrachtError extends Error {
  constructor() {
    super("Je hebt geen toegang tot deze opdracht.");
    this.name = "GeenToegangTotOpdrachtError";
  }
}

export interface NieuweOpdracht {
  companyId: string;
  skillId: string;
  specializationId?: string;
  titel?: string;
  locatiePlaats: string;
  locatieAdres?: string;
  startdatum: Date;
  einddatum?: Date;
  duurDagen?: number;
  aantalPersonen: number;
  gewenstUurtariefCents?: number;
  omschrijving: string;
  eigenGereedschapGewenst: boolean;
  contactpersoon?: string;
  vereistenTekst?: string;
  certificationIds: string[];
  publiceren: boolean;
}

export async function createJob(
  userId: string,
  input: NieuweOpdracht,
): Promise<Job> {
  const membership = await getMembership(userId, input.companyId);
  if (!membership) throw new GeenToegangTotOpdrachtError();

  const skill = await db.skill.findUniqueOrThrow({
    where: { id: input.skillId },
  });
  const titel = input.titel?.trim() || `${skill.naam} gezocht`;
  const slug = slugWithSuffix(skill.naam, input.locatiePlaats);

  return db.job.create({
    data: {
      companyId: input.companyId,
      skillId: input.skillId,
      specializationId: input.specializationId ?? null,
      titel,
      slug,
      omschrijving: input.omschrijving,
      locatiePlaats: input.locatiePlaats,
      locatieAdres: input.locatieAdres ?? null,
      startdatum: input.startdatum,
      einddatum: input.einddatum ?? null,
      duurDagen: input.duurDagen ?? null,
      aantalPersonen: input.aantalPersonen,
      gewenstUurtariefCents: input.gewenstUurtariefCents ?? null,
      eigenGereedschapGewenst: input.eigenGereedschapGewenst,
      contactpersoon: input.contactpersoon ?? null,
      status: input.publiceren ? "GEPUBLICEERD" : "CONCEPT",
      requirements: {
        create: [
          ...input.certificationIds.map((certificationId) => ({
            certificationId,
            hard: true,
          })),
          ...(input.vereistenTekst
            ? [{ vrijeTekst: input.vereistenTekst, hard: false }]
            : []),
        ],
      },
    },
  });
}

const jobInclude = {
  skill: true,
  specialization: true,
  requirements: { include: { certification: true } },
  company: true,
} satisfies Prisma.JobInclude;

export type JobWithRelations = Prisma.JobGetPayload<{
  include: typeof jobInclude;
}>;

/** Opdrachten van de bedrijven waar de gebruiker lid van is. */
export async function listJobsForUser(
  userId: string,
): Promise<JobWithRelations[]> {
  return db.job.findMany({
    where: {
      deletedAt: null,
      company: { members: { some: { userId } } },
    },
    include: jobInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getJobForUser(
  userId: string,
  jobId: string,
): Promise<JobWithRelations | null> {
  return db.job.findFirst({
    where: {
      id: jobId,
      deletedAt: null,
      company: { members: { some: { userId } } },
    },
    include: jobInclude,
  });
}

export async function setJobStatus(
  userId: string,
  jobId: string,
  status: JobStatus,
): Promise<void> {
  const job = await getJobForUser(userId, jobId);
  if (!job) throw new GeenToegangTotOpdrachtError();
  await db.job.update({ where: { id: jobId }, data: { status } });
}
