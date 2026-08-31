import "server-only";
import type { Prisma, Review } from "@prisma/client";
import { db } from "@/lib/db";
import { notify } from "@/server/notifications/service";
import { generateInvoiceForAssignment } from "@/server/payments/invoices";
import type { ReviewInput } from "@/lib/validations/review";

export class GeenToegangError extends Error {
  constructor(msg = "Geen toegang.") {
    super(msg);
    this.name = "GeenToegangError";
  }
}
export class ReviewBestaatAlError extends Error {
  constructor() {
    super("Je hebt deze opdracht al beoordeeld.");
    this.name = "ReviewBestaatAlError";
  }
}
export class OpdrachtNietAfgerondError extends Error {
  constructor() {
    super("Je kunt pas beoordelen nadat de opdracht is afgerond.");
    this.name = "OpdrachtNietAfgerondError";
  }
}

const assignmentInclude = {
  job: { include: { skill: true } },
  company: true,
  zzpProfile: true,
  reviews: true,
} satisfies Prisma.AssignmentInclude;

export type AssignmentWithRelations = Prisma.AssignmentGetPayload<{
  include: typeof assignmentInclude;
}>;

/** Bepaalt of de gebruiker de bedrijfs- of ZZP-kant van de opdracht is. */
async function rolInAssignment(
  userId: string,
  assignment: { companyId: string; zzpProfileId: string },
): Promise<"BEDRIJF" | "ZZP" | null> {
  const zzp = await db.zZPProfile.findUnique({
    where: { id: assignment.zzpProfileId },
    select: { userId: true },
  });
  if (zzp?.userId === userId) return "ZZP";
  const member = await db.companyMember.findFirst({
    where: { companyId: assignment.companyId, userId },
    select: { id: true },
  });
  return member ? "BEDRIJF" : null;
}

export async function getAssignmentForUser(
  userId: string,
  assignmentId: string,
): Promise<AssignmentWithRelations | null> {
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: assignmentInclude,
  });
  if (!assignment) return null;
  const rol = await rolInAssignment(userId, assignment);
  return rol ? assignment : null;
}

export async function getAssignmentForJob(
  userId: string,
  jobId: string,
): Promise<AssignmentWithRelations | null> {
  return db.assignment.findFirst({
    where: { jobId, company: { members: { some: { userId } } } },
    include: assignmentInclude,
  });
}

export async function listAssignmentsForUser(
  userId: string,
): Promise<AssignmentWithRelations[]> {
  return db.assignment.findMany({
    where: {
      OR: [
        { zzpProfile: { userId } },
        { company: { members: { some: { userId } } } },
      ],
    },
    include: assignmentInclude,
    orderBy: { createdAt: "desc" },
  });
}

/** Bedrijf markeert de opdracht als afgerond (voorwaarde voor reviews). */
export async function completeAssignment(
  userId: string,
  assignmentId: string,
  gewerkteUren?: number,
): Promise<void> {
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    select: { companyId: true, zzpProfileId: true },
  });
  if (!assignment) throw new GeenToegangError();
  const rol = await rolInAssignment(userId, assignment);
  if (rol !== "BEDRIJF") throw new GeenToegangError();

  await db.assignment.update({
    where: { id: assignmentId },
    data: {
      status: "AFGEROND",
      gewerkteUren: gewerkteUren ?? undefined,
      einddatum: new Date(),
    },
  });

  // Genereer (idempotent) de bemiddelingsfactuur op basis van de fee-instellingen.
  await generateInvoiceForAssignment(assignmentId);
}

export async function createReview(
  userId: string,
  assignmentId: string,
  input: ReviewInput,
): Promise<Review> {
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: { job: true, zzpProfile: true },
  });
  if (!assignment) throw new GeenToegangError();
  const rol = await rolInAssignment(userId, assignment);
  if (!rol) throw new GeenToegangError();
  if (assignment.status !== "AFGEROND") throw new OpdrachtNietAfgerondError();

  const richting = rol === "BEDRIJF" ? "BEDRIJF_NAAR_ZZP" : "ZZP_NAAR_BEDRIJF";

  const bestaand = await db.review.findUnique({
    where: { assignmentId_richting: { assignmentId, richting } },
  });
  if (bestaand) throw new ReviewBestaatAlError();

  const review = await db.review.create({
    data: {
      assignmentId,
      richting,
      auteurUserId: userId,
      overZzpProfileId:
        richting === "BEDRIJF_NAAR_ZZP" ? assignment.zzpProfileId : null,
      overCompanyId:
        richting === "ZZP_NAAR_BEDRIJF" ? assignment.companyId : null,
      scoreKwaliteit: input.scoreKwaliteit,
      scoreCommunicatie: input.scoreCommunicatie,
      scoreBetrouwbaarheid: input.scoreBetrouwbaarheid,
      scoreAfspraken: input.scoreAfspraken,
      toelichting: input.toelichting ?? null,
    },
  });

  // Notificeer de beoordeelde partij.
  if (richting === "BEDRIJF_NAAR_ZZP") {
    await notify({
      userId: assignment.zzpProfile.userId,
      type: "REVIEW_ONTVANGEN",
      titel: "Je hebt een review ontvangen",
      tekst: `Een bedrijf heeft je beoordeeld voor "${assignment.job.titel}".`,
      link: `/zzpers/profiel`,
    });
  } else {
    const members = await db.companyMember.findMany({
      where: { companyId: assignment.companyId },
      select: { userId: true },
    });
    await Promise.all(
      members.map((m) =>
        notify({
          userId: m.userId,
          type: "REVIEW_ONTVANGEN",
          titel: "Je hebt een review ontvangen",
          tekst: `Een zzp’er heeft je beoordeeld voor "${assignment.job.titel}".`,
          link: `/bedrijven/dashboard`,
        }),
      ),
    );
  }

  return review;
}

const reviewInclude = {
  assignment: { include: { company: true, job: true } },
} satisfies Prisma.ReviewInclude;

export type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: typeof reviewInclude;
}>;

export async function getReviewsForZzp(
  zzpProfileId: string,
): Promise<ReviewWithRelations[]> {
  return db.review.findMany({
    where: { overZzpProfileId: zzpProfileId, richting: "BEDRIJF_NAAR_ZZP" },
    include: reviewInclude,
    orderBy: { gepubliceerdOp: "desc" },
  });
}
