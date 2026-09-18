import "server-only";
import { db } from "@/lib/db";

export interface PlatformStats {
  zzpers: number;
  bedrijven: number;
  zichtbareProfielen: number;
  gesprekken: number;
  berichten: number;
  berichtenLaatste7Dagen: number;
  openReports: number;
  openKlachten: number;
  nieuweContactberichten: number;
  wachtendeVerificaties: number;
}

/**
 * Kernstatistieken voor het admin-dashboard. Belangrijkste getal is niet het
 * aantal gebruikers maar het aantal gesprekken: contact dat via het platform
 * tot stand komt.
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const weekGeleden = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    zzpers,
    bedrijven,
    zichtbareProfielen,
    gesprekken,
    berichten,
    berichtenLaatste7Dagen,
    openReports,
    openKlachten,
    nieuweContactberichten,
    wachtendeVerificaties,
  ] = await Promise.all([
    db.user.count({ where: { role: "ZZP" } }),
    db.company.count(),
    db.zZPProfile.count({ where: { zichtbaar: true } }),
    db.conversation.count(),
    db.message.count(),
    db.message.count({ where: { createdAt: { gte: weekGeleden } } }),
    db.report.count({ where: { status: "OPEN" } }),
    db.complaint.count({ where: { status: "OPEN" } }),
    db.contactMessage.count({ where: { status: "NIEUW" } }),
    db.zZPProfile.count({ where: { verificatieStatus: "IN_BEHANDELING" } }),
  ]);

  return {
    zzpers,
    bedrijven,
    zichtbareProfielen,
    gesprekken,
    berichten,
    berichtenLaatste7Dagen,
    openReports,
    openKlachten,
    nieuweContactberichten,
    wachtendeVerificaties,
  };
}
