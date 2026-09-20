import "server-only";
import type { Company, CompanyMember, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Haalt het bedrijf van een gebruiker op, of maakt een leeg bedrijf + OWNER-
 * lidmaatschap aan als dat nog niet bestaat. Eén gebruiker hoort bij één bedrijf
 * in de MVP; teamaccounts (meerdere leden) zijn voorbereid via CompanyMember.
 */
export async function getOrCreateCompanyForUser(
  userId: string,
): Promise<Company> {
  const membership = await db.companyMember.findFirst({
    where: { userId },
    include: { company: true },
  });
  if (membership) return membership.company;

  return db.company.create({
    data: {
      naam: "",
      members: { create: { userId, role: "OWNER" } },
    },
  });
}

export async function getCompanyForUser(
  userId: string,
): Promise<Company | null> {
  const membership = await db.companyMember.findFirst({
    where: { userId },
    include: { company: true },
  });
  return membership?.company ?? null;
}

/**
 * Een opdrachtgever kan pas verder (etalage, profielen, contact) als het
 * bedrijfsprofiel een naam én een KvK-nummer heeft.
 */
export function bedrijfCompleet(company: Pick<Company, "naam" | "kvkNummer"> | null): boolean {
  return !!company && company.naam.trim() !== "" && !!company.kvkNummer;
}

/**
 * Pad waarnaar een opdrachtgever zonder compleet bedrijfsprofiel wordt
 * gestuurd, of null als alles in orde is. `terug` is het pad om na het
 * invullen naar terug te keren.
 */
export async function bedrijfOnboardingPad(
  userId: string,
  terug: string,
): Promise<string | null> {
  const company = await getCompanyForUser(userId);
  if (bedrijfCompleet(company)) return null;
  return `/bedrijven/registreren?next=${encodeURIComponent(terug)}`;
}

/** Controleert of een gebruiker lid is van het bedrijf (autorisatie). */
export async function getMembership(
  userId: string,
  companyId: string,
): Promise<CompanyMember | null> {
  return db.companyMember.findUnique({
    where: { companyId_userId: { companyId, userId } },
  });
}

type CompanyData = Pick<
  Prisma.CompanyUpdateInput,
  | "naam"
  | "kvkNummer"
  | "omschrijving"
  | "website"
  | "telefoon"
  | "contactpersoon"
  | "regio"
  | "typeWerkzaamheden"
>;

export async function updateCompany(
  userId: string,
  data: CompanyData,
): Promise<Company> {
  const company = await getOrCreateCompanyForUser(userId);
  return db.company.update({ where: { id: company.id }, data });
}
