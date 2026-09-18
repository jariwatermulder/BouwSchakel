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
        conversations: { include: { messages: true } },
        zzpInvoices: { include: { lines: true } },
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
 * het datamodel verwijderen gekoppelde gegevens (profiel, gesprekken, sessies,
 * berichten, facturen, notificaties). Bedrijven met andere leden blijven bestaan.
 */
export async function deleteAccount(userId: string): Promise<void> {
  // Bedrijven waarvan deze gebruiker het enige lid is, gaan mee (inclusief
  // gesprekken, berichten en eigen facturen). Bedrijven met andere leden
  // blijven bestaan; alleen het lidmaatschap vervalt.
  const lidVan = await db.companyMember.findMany({
    where: { userId },
    select: { companyId: true },
  });
  const alleenLid: string[] = [];
  for (const { companyId } of lidVan) {
    const anderen = await db.companyMember.count({
      where: { companyId, userId: { not: userId } },
    });
    if (anderen === 0) alleenLid.push(companyId);
  }

  await db.$transaction([
    ...(alleenLid.length > 0
      ? [db.company.deleteMany({ where: { id: { in: alleenLid } } })]
      : []),
    db.user.delete({ where: { id: userId } }),
  ]);
}
