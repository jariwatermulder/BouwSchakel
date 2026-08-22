import "server-only";
import type {
  AdminRole,
  Certification,
  Prisma,
  Skill,
  UserStatus,
  VerificatieStatus,
} from "@prisma/client";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

// ── Gebruikers ───────────────────────────────────────────────────────────────
export async function listUsers(zoek?: string) {
  return db.user.findMany({
    where: zoek ? { email: { contains: zoek, mode: "insensitive" } } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      role: true,
      adminRole: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function setUserStatus(userId: string, status: UserStatus) {
  await db.user.update({ where: { id: userId }, data: { status } });
}

export async function setAdminRole(
  userId: string,
  adminRole: AdminRole | null,
) {
  await db.user.update({
    where: { id: userId },
    data: {
      adminRole,
      role: adminRole ? "ADMIN" : undefined,
    },
  });
}

// ── Bedrijven ────────────────────────────────────────────────────────────────
export async function listCompanies() {
  return db.company.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { jobs: true, members: true } } },
  });
}

export async function setCompanyVerificatie(
  companyId: string,
  status: VerificatieStatus,
) {
  await db.company.update({
    where: { id: companyId },
    data: { verificatieStatus: status },
  });
}

// ── Verificaties (ZZP + documenten) ─────────────────────────────────────────
export async function listZzpVerificaties() {
  return db.zZPProfile.findMany({
    where: {
      verificatieStatus: { in: ["IN_BEHANDELING", "NIET_GEVERIFIEERD"] },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      voornaam: true,
      achternaam: true,
      kvkNummer: true,
      verificatieStatus: true,
      profielCompleetheidPct: true,
    },
  });
}

export async function setZzpVerificatie(
  zzpProfileId: string,
  status: VerificatieStatus,
) {
  await db.zZPProfile.update({
    where: { id: zzpProfileId },
    data: { verificatieStatus: status },
  });
}

export async function listDocuments() {
  return db.document.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { owner: { select: { email: true } } },
  });
}

export async function setDocumentStatus(
  documentId: string,
  status: VerificatieStatus,
) {
  await db.document.update({ where: { id: documentId }, data: { status } });
}

// ── Reviews (moderatie) ──────────────────────────────────────────────────────
export async function listReviews() {
  return db.review.findMany({
    orderBy: { gepubliceerdOp: "desc" },
    take: 100,
    include: { assignment: { include: { job: true, company: true } } },
  });
}

export async function deleteReview(reviewId: string) {
  await db.review.delete({ where: { id: reviewId } });
}

// ── Reports & klachten ───────────────────────────────────────────────────────
export async function listReports() {
  return db.report.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function setReportStatus(
  reportId: string,
  status: Prisma.ReportUpdateInput["status"],
) {
  await db.report.update({
    where: { id: reportId },
    data: { status, afgehandeldOp: new Date() },
  });
}

export async function listComplaints() {
  return db.complaint.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
}

export async function setComplaintStatus(
  complaintId: string,
  status: Prisma.ComplaintUpdateInput["status"],
) {
  await db.complaint.update({ where: { id: complaintId }, data: { status } });
}

// ── Catalogus ────────────────────────────────────────────────────────────────
export async function listAllSkills(): Promise<Skill[]> {
  return db.skill.findMany({ orderBy: { naam: "asc" } });
}

export async function createSkill(naam: string): Promise<void> {
  await db.skill.create({ data: { naam, slug: slugify(naam) } });
}

export async function toggleSkill(id: string, actief: boolean): Promise<void> {
  await db.skill.update({ where: { id }, data: { actief } });
}

export async function listAllCertifications(): Promise<Certification[]> {
  return db.certification.findMany({ orderBy: { naam: "asc" } });
}

export async function createCertification(naam: string): Promise<void> {
  await db.certification.create({ data: { naam, slug: slugify(naam) } });
}

export async function toggleCertification(
  id: string,
  actief: boolean,
): Promise<void> {
  await db.certification.update({ where: { id }, data: { actief } });
}

// ── Audit log ────────────────────────────────────────────────────────────────
export async function listAuditLog() {
  return db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { email: true } } },
  });
}
