"use server";

import { revalidatePath } from "next/cache";
import type {
  AdminRole,
  ComplaintStatus,
  ReportStatus,
  VerificatieStatus,
} from "@prisma/client";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { logAudit } from "@/server/admin/audit";
import { matchingSettingSchema } from "@/lib/validations/matching";
import { updateMatchingConfig } from "@/server/matching/settings";
import * as admin from "@/server/admin/service";

const VERIF: VerificatieStatus[] = [
  "NIET_GEVERIFIEERD",
  "IN_BEHANDELING",
  "GEVERIFIEERD",
  "AFGEKEURD",
];

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  return typeof v === "string" ? v : null;
}

// ── Gebruikers ───────────────────────────────────────────────────────────────
export async function blokkeerGebruiker(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("ADMIN");
  const id = str(fd, "userId");
  const blok = str(fd, "blokkeren") === "1";
  if (!id) return;
  await admin.setUserStatus(id, blok ? "GEBLOKKEERD" : "ACTIEF");
  await logAudit({
    actorUserId: actor.id,
    actie: blok ? "gebruiker_geblokkeerd" : "gebruiker_gedeblokkeerd",
    subjectType: "User",
    subjectId: id,
  });
  revalidatePath("/admin/gebruikers");
}

export async function wijzigAdminRol(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("SUPER_ADMIN");
  const id = str(fd, "userId");
  const rolRaw = str(fd, "adminRole");
  if (!id) return;
  const geldig: AdminRole[] = ["SUPPORT", "MODERATOR", "ADMIN", "SUPER_ADMIN"];
  const adminRole =
    rolRaw && geldig.includes(rolRaw as AdminRole)
      ? (rolRaw as AdminRole)
      : null;
  await admin.setAdminRole(id, adminRole);
  await logAudit({
    actorUserId: actor.id,
    actie: "adminrol_gewijzigd",
    subjectType: "User",
    subjectId: id,
    meta: { adminRole },
  });
  revalidatePath("/admin/gebruikers");
}

// ── Verificaties ─────────────────────────────────────────────────────────────
export async function verifieerBedrijf(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("MODERATOR");
  const id = str(fd, "companyId");
  const status = str(fd, "status");
  if (!id || !status || !VERIF.includes(status as VerificatieStatus)) return;
  await admin.setCompanyVerificatie(id, status as VerificatieStatus);
  await logAudit({
    actorUserId: actor.id,
    actie: "bedrijf_verificatie",
    subjectType: "Company",
    subjectId: id,
    meta: { status },
  });
  revalidatePath("/admin/bedrijven");
}

export async function verifieerZzp(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("MODERATOR");
  const id = str(fd, "zzpProfileId");
  const status = str(fd, "status");
  if (!id || !status || !VERIF.includes(status as VerificatieStatus)) return;
  await admin.setZzpVerificatie(id, status as VerificatieStatus);
  await logAudit({
    actorUserId: actor.id,
    actie: "zzp_verificatie",
    subjectType: "ZZPProfile",
    subjectId: id,
    meta: { status },
  });
  revalidatePath("/admin/verificaties");
}

export async function verifieerDocument(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("MODERATOR");
  const id = str(fd, "documentId");
  const status = str(fd, "status");
  if (!id || !status || !VERIF.includes(status as VerificatieStatus)) return;
  await admin.setDocumentStatus(id, status as VerificatieStatus);
  await logAudit({
    actorUserId: actor.id,
    actie: "document_verificatie",
    subjectType: "Document",
    subjectId: id,
    meta: { status },
  });
  revalidatePath("/admin/verificaties");
}

// ── Moderatie ────────────────────────────────────────────────────────────────
export async function verwijderReview(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("MODERATOR");
  const id = str(fd, "reviewId");
  if (!id) return;
  await admin.deleteReview(id);
  await logAudit({
    actorUserId: actor.id,
    actie: "review_verwijderd",
    subjectType: "Review",
    subjectId: id,
  });
  revalidatePath("/admin/reviews");
}

export async function behandelReport(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("MODERATOR");
  const id = str(fd, "reportId");
  const status = str(fd, "status");
  const geldig: ReportStatus[] = [
    "OPEN",
    "IN_BEHANDELING",
    "AFGEHANDELD",
    "AFGEWEZEN",
  ];
  if (!id || !status || !geldig.includes(status as ReportStatus)) return;
  await admin.setReportStatus(id, status as ReportStatus);
  await logAudit({
    actorUserId: actor.id,
    actie: "report_behandeld",
    subjectType: "Report",
    subjectId: id,
    meta: { status },
  });
  revalidatePath("/admin/reports");
}

export async function behandelKlacht(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("MODERATOR");
  const id = str(fd, "complaintId");
  const status = str(fd, "status");
  const geldig: ComplaintStatus[] = ["OPEN", "IN_BEHANDELING", "AFGEHANDELD"];
  if (!id || !status || !geldig.includes(status as ComplaintStatus)) return;
  await admin.setComplaintStatus(id, status as ComplaintStatus);
  await logAudit({
    actorUserId: actor.id,
    actie: "klacht_behandeld",
    subjectType: "Complaint",
    subjectId: id,
    meta: { status },
  });
  revalidatePath("/admin/klachten");
}

// ── Matching-instellingen ────────────────────────────────────────────────────
export interface MatchingState {
  error?: string;
  ok?: boolean;
}

export async function opslaanMatchingInstellingen(
  _prev: MatchingState,
  fd: FormData,
): Promise<MatchingState> {
  const actor = await requireCurrentAdmin("ADMIN");
  const parsed = matchingSettingSchema.safeParse({
    gewichtVakgebied: fd.get("gewichtVakgebied"),
    gewichtBeschikbaarheid: fd.get("gewichtBeschikbaarheid"),
    gewichtSpecialisatie: fd.get("gewichtSpecialisatie"),
    gewichtLocatie: fd.get("gewichtLocatie"),
    gewichtTarief: fd.get("gewichtTarief"),
    gewichtErvaring: fd.get("gewichtErvaring"),
    gewichtCertificaten: fd.get("gewichtCertificaten"),
    gewichtBetrouwbaarheid: fd.get("gewichtBetrouwbaarheid"),
    minMatchScore: fd.get("minMatchScore"),
    maxAfstandKm: fd.get("maxAfstandKm"),
  });
  if (!parsed.success) return { error: "Controleer de ingevulde waarden." };
  await updateMatchingConfig(parsed.data);
  await logAudit({
    actorUserId: actor.id,
    actie: "matching_instellingen_gewijzigd",
    meta: parsed.data,
  });
  revalidatePath("/admin/matching");
  return { ok: true };
}

// ── Catalogus ────────────────────────────────────────────────────────────────
export async function nieuweSkill(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("ADMIN");
  const naam = str(fd, "naam")?.trim();
  if (!naam) return;
  await admin.createSkill(naam);
  await logAudit({
    actorUserId: actor.id,
    actie: "skill_toegevoegd",
    meta: { naam },
  });
  revalidatePath("/admin/catalogus");
}

export async function toggleSkillActief(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("ADMIN");
  const id = str(fd, "id");
  const actief = str(fd, "actief") === "1";
  if (!id) return;
  await admin.toggleSkill(id, actief);
  await logAudit({
    actorUserId: actor.id,
    actie: "skill_gewijzigd",
    subjectType: "Skill",
    subjectId: id,
    meta: { actief },
  });
  revalidatePath("/admin/catalogus");
}

export async function nieuwCertificaat(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("ADMIN");
  const naam = str(fd, "naam")?.trim();
  if (!naam) return;
  await admin.createCertification(naam);
  await logAudit({
    actorUserId: actor.id,
    actie: "certificaat_toegevoegd",
    meta: { naam },
  });
  revalidatePath("/admin/catalogus");
}

export async function toggleCertificaatActief(fd: FormData): Promise<void> {
  const actor = await requireCurrentAdmin("ADMIN");
  const id = str(fd, "id");
  const actief = str(fd, "actief") === "1";
  if (!id) return;
  await admin.toggleCertification(id, actief);
  await logAudit({
    actorUserId: actor.id,
    actie: "certificaat_gewijzigd",
    subjectType: "Certification",
    subjectId: id,
    meta: { actief },
  });
  revalidatePath("/admin/catalogus");
}
