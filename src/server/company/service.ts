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
