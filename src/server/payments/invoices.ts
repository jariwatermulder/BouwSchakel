import "server-only";
import type { Invoice, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { berekenFee } from "@/server/payments/fees";
import { getPricing } from "@/server/payments/pricing";

/**
 * Genereert (idempotent) een factuur voor een afgeronde opdracht op basis van
 * de bemiddelingsfee. Wordt aangeroepen wanneer een Assignment op AFGEROND
 * wordt gezet. Eén factuur per assignment (unique).
 */
export async function generateInvoiceForAssignment(
  assignmentId: string,
): Promise<Invoice | null> {
  const bestaand = await db.invoice.findUnique({ where: { assignmentId } });
  if (bestaand) return bestaand;

  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: { job: true },
  });
  if (!assignment) return null;

  const pricing = await getPricing();
  const fee = berekenFee(
    {
      feeModel: pricing.feeModel,
      succesfeePerUurCents: pricing.succesfeePerUurCents,
      vasteBemiddelingsfeeCents: pricing.vasteBemiddelingsfeeCents,
      btwPercentage: pricing.btwPercentage,
    },
    assignment.gewerkteUren,
  );

  // Geen fee (bijv. per-uur zonder ingevulde uren) → geen factuur.
  if (fee.subtotaalCents <= 0) return null;

  const omschrijving =
    pricing.feeModel === "PER_UUR"
      ? `Bemiddelingsfee — ${assignment.gewerkteUren ?? 0} uur × opdracht "${assignment.job.titel}"`
      : `Bemiddelingsfee — opdracht "${assignment.job.titel}"`;

  return db.invoice.create({
    data: {
      companyId: assignment.companyId,
      assignmentId: assignment.id,
      omschrijving,
      subtotaalCents: fee.subtotaalCents,
      btwCents: fee.btwCents,
      bedragCents: fee.bedragCents,
      status: "OPEN",
    },
  });
}

const invoiceInclude = {
  assignment: { include: { job: true } },
} satisfies Prisma.InvoiceInclude;

export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: typeof invoiceInclude;
}>;

export async function listInvoicesForUser(
  userId: string,
): Promise<InvoiceWithRelations[]> {
  return db.invoice.findMany({
    where: { company: { members: { some: { userId } } } },
    include: invoiceInclude,
    orderBy: { uitgegevenOp: "desc" },
  });
}

export async function listAllInvoices(): Promise<InvoiceWithRelations[]> {
  return db.invoice.findMany({
    include: invoiceInclude,
    orderBy: { uitgegevenOp: "desc" },
    take: 200,
  });
}
