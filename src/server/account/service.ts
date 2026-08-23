import "server-only";
import { db } from "@/lib/db";

/**
 * AVG: gegevensexport en accountverwijdering.
 * Zie docs/SECURITY.md §9 en docs/LEGAL_CONSIDERATIONS.md §5.
 */
export async function exportUserData(
  userId: string,
): Promise<Record<string, unknown>> {
  const [user, zzpProfile, memberships, notifications] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerifiedAt: true,
      },
    }),
    db.zZPProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        specializations: { include: { specialization: true } },
        certifications: { include: { certification: true } },
        availability: true,
        portfolio: true,
        applications: true,
        assignments: true,
      },
    }),
    db.companyMember.findMany({
      where: { userId },
      include: { company: true },
    }),
    db.notification.findMany({ where: { userId } }),
  ]);

  return {
    geexporteerdOp: new Date().toISOString(),
    account: user,
    zzpProfiel: zzpProfile,
    bedrijfslidmaatschappen: memberships,
    notificaties: notifications,
  };
}

/**
 * Verwijdert het account onherroepelijk (recht op vergetelheid). Cascades in
 * het datamodel verwijderen gekoppelde gegevens (profiel, reacties, sessies,
 * berichten, notificaties). Bedrijven met andere leden blijven bestaan.
 */
export async function deleteAccount(userId: string): Promise<void> {
  await db.user.delete({ where: { id: userId } });
}
