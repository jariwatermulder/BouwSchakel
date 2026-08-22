import "server-only";
import { db } from "@/lib/db";

export interface PlatformStats {
  zzpers: number;
  bedrijven: number;
  zichtbareProfielen: number;
  gepubliceerdeOpdrachten: number;
  opdrachtenTotaal: number;
  reacties: number;
  assignments: number;
  afgerondeAssignments: number;
  reviews: number;
  openReports: number;
  openKlachten: number;
  wachtendeVerificaties: number;
}

/**
 * Kernstatistieken voor het admin-dashboard. Belangrijkste getal is niet het
 * aantal gebruikers maar het aantal succesvolle matches (assignments).
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const [
    zzpers,
    bedrijven,
    zichtbareProfielen,
    gepubliceerdeOpdrachten,
    opdrachtenTotaal,
    reacties,
    assignments,
    afgerondeAssignments,
    reviews,
    openReports,
    openKlachten,
    wachtendeVerificaties,
  ] = await Promise.all([
    db.user.count({ where: { role: "ZZP" } }),
    db.company.count(),
    db.zZPProfile.count({ where: { zichtbaar: true } }),
    db.job.count({ where: { status: "GEPUBLICEERD" } }),
    db.job.count(),
    db.application.count(),
    db.assignment.count(),
    db.assignment.count({ where: { status: "AFGEROND" } }),
    db.review.count(),
    db.report.count({ where: { status: "OPEN" } }),
    db.complaint.count({ where: { status: "OPEN" } }),
    db.zZPProfile.count({ where: { verificatieStatus: "IN_BEHANDELING" } }),
  ]);

  return {
    zzpers,
    bedrijven,
    zichtbareProfielen,
    gepubliceerdeOpdrachten,
    opdrachtenTotaal,
    reacties,
    assignments,
    afgerondeAssignments,
    reviews,
    openReports,
    openKlachten,
    wachtendeVerificaties,
  };
}
