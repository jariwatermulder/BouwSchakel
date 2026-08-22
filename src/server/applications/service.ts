import "server-only";
import { Prisma } from "@prisma/client";
import type { Application } from "@prisma/client";
import { db } from "@/lib/db";
import { notify } from "@/server/notifications/service";

export class ReactieBestaatAlError extends Error {
  constructor() {
    super("Je hebt al op deze opdracht gereageerd.");
    this.name = "ReactieBestaatAlError";
  }
}
export class GeenToegangError extends Error {
  constructor() {
    super("Geen toegang.");
    this.name = "GeenToegangError";
  }
}

async function isCompanyMemberOfJob(
  userId: string,
  jobId: string,
): Promise<{ companyId: string; titel: string } | null> {
  const job = await db.job.findFirst({
    where: { id: jobId, company: { members: { some: { userId } } } },
    select: { companyId: true, titel: true },
  });
  return job;
}

async function notifyCompany(
  companyId: string,
  n: {
    type: Parameters<typeof notify>[0]["type"];
    titel: string;
    tekst: string;
    link: string;
  },
): Promise<void> {
  const members = await db.companyMember.findMany({
    where: { companyId },
    select: { userId: true },
  });
  await Promise.all(members.map((m) => notify({ userId: m.userId, ...n })));
}

/** ZZP'er reageert op een gepubliceerde opdracht. */
export async function applyToJob(
  userId: string,
  jobId: string,
  input: { bericht?: string; uurtariefVoorstelCents?: number },
): Promise<Application> {
  const profile = await db.zZPProfile.findUnique({ where: { userId } });
  if (!profile) throw new GeenToegangError();

  const job = await db.job.findFirst({
    where: { id: jobId, status: "GEPUBLICEERD", deletedAt: null },
    select: { id: true, companyId: true, titel: true },
  });
  if (!job) throw new GeenToegangError();

  try {
    const application = await db.application.create({
      data: {
        jobId,
        zzpProfileId: profile.id,
        richting: "SOLLICITATIE",
        status: "NIEUW",
        bericht: input.bericht ?? null,
        uurtariefVoorstelCents: input.uurtariefVoorstelCents ?? null,
      },
    });
    const naam =
      [profile.voornaam, profile.achternaam].filter(Boolean).join(" ") ||
      "Een vakman";
    await notifyCompany(job.companyId, {
      type: "NIEUWE_REACTIE",
      titel: "Nieuwe reactie op je opdracht",
      tekst: `${naam} heeft gereageerd op "${job.titel}".`,
      link: `/bedrijven/opdrachten/${job.id}`,
    });
    return application;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new ReactieBestaatAlError();
    }
    throw err;
  }
}

/** Bedrijf nodigt een ZZP'er uit voor een opdracht. */
export async function inviteZzp(
  userId: string,
  jobId: string,
  zzpProfileId: string,
): Promise<void> {
  const job = await isCompanyMemberOfJob(userId, jobId);
  if (!job) throw new GeenToegangError();

  const profile = await db.zZPProfile.findUnique({
    where: { id: zzpProfileId },
    select: { userId: true },
  });
  if (!profile) throw new GeenToegangError();

  await db.application.upsert({
    where: { jobId_zzpProfileId: { jobId, zzpProfileId } },
    update: { status: "UITGENODIGD" },
    create: {
      jobId,
      zzpProfileId,
      richting: "UITNODIGING",
      status: "UITGENODIGD",
    },
  });

  await notify({
    userId: profile.userId,
    type: "UITNODIGING",
    titel: "Je bent uitgenodigd voor een opdracht",
    tekst: `Een bedrijf nodigt je uit voor "${job.titel}".`,
    link: `/zzpers/opdrachten/${jobId}`,
  });
}

const applicationInclude = {
  zzpProfile: true,
  job: { include: { company: true, skill: true } },
} satisfies Prisma.ApplicationInclude;

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: typeof applicationInclude;
}>;

export async function listApplicationsForJob(
  userId: string,
  jobId: string,
): Promise<ApplicationWithRelations[]> {
  const job = await isCompanyMemberOfJob(userId, jobId);
  if (!job) throw new GeenToegangError();
  return db.application.findMany({
    where: { jobId },
    include: applicationInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function listApplicationsForZzp(
  userId: string,
): Promise<ApplicationWithRelations[]> {
  const profile = await db.zZPProfile.findUnique({ where: { userId } });
  if (!profile) return [];
  return db.application.findMany({
    where: { zzpProfileId: profile.id },
    include: applicationInclude,
    orderBy: { createdAt: "desc" },
  });
}

/** Bedrijf selecteert een kandidaat: maakt een opdracht (Assignment) aan. */
export async function selectCandidate(
  userId: string,
  applicationId: string,
): Promise<void> {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: { job: true, zzpProfile: true },
  });
  if (!application) throw new GeenToegangError();
  const member = await isCompanyMemberOfJob(userId, application.jobId);
  if (!member) throw new GeenToegangError();

  await db.$transaction([
    db.assignment.create({
      data: {
        jobId: application.jobId,
        zzpProfileId: application.zzpProfileId,
        companyId: application.job.companyId,
        status: "GEPLAND",
        startdatum: application.job.startdatum,
        einddatum: application.job.einddatum,
      },
    }),
    db.application.update({
      where: { id: applicationId },
      data: { status: "GEACCEPTEERD" },
    }),
    db.job.update({
      where: { id: application.jobId },
      data: { status: "VERVULD" },
    }),
  ]);

  await notify({
    userId: application.zzpProfile.userId,
    type: "GESELECTEERD",
    titel: "Je bent geselecteerd!",
    tekst: `Je bent geselecteerd voor "${application.job.titel}".`,
    link: `/zzpers/opdrachten/${application.jobId}`,
  });
}

export async function rejectApplication(
  userId: string,
  applicationId: string,
): Promise<void> {
  const application = await db.application.findUnique({
    where: { id: applicationId },
    include: { job: true, zzpProfile: true },
  });
  if (!application) throw new GeenToegangError();
  const member = await isCompanyMemberOfJob(userId, application.jobId);
  if (!member) throw new GeenToegangError();

  await db.application.update({
    where: { id: applicationId },
    data: { status: "AFGEWEZEN" },
  });
  await notify({
    userId: application.zzpProfile.userId,
    type: "AFGEWEZEN",
    titel: "Opdracht niet doorgegaan",
    tekst: `Je reactie op "${application.job.titel}" is helaas niet geselecteerd.`,
    link: `/zzpers/opdrachten`,
  });
}

/** ZZP'er trekt de eigen reactie in. */
export async function withdrawApplication(
  userId: string,
  applicationId: string,
): Promise<void> {
  const profile = await db.zZPProfile.findUnique({ where: { userId } });
  if (!profile) throw new GeenToegangError();
  const result = await db.application.updateMany({
    where: { id: applicationId, zzpProfileId: profile.id },
    data: { status: "INGETROKKEN" },
  });
  if (result.count === 0) throw new GeenToegangError();
}
