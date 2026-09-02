import "server-only";
import { db } from "@/lib/db";

/**
 * Facturenmodule voor zzp'ers: opmaken, opslaan en teruglezen van eigen
 * facturen (in ZZP Connect-huisstijl). Afzender- en klantgegevens worden als
 * momentopname op de factuur bewaard. Zie ook de PDF-route.
 */

export type FactuurRegelInput = {
  omschrijving: string;
  aantal: number;
  tariefCents: number;
};

export type FactuurInput = {
  assignmentId?: string | null;
  factuurnummer: string;
  factuurdatum: Date;
  vervaldatum?: Date | null;
  afzenderNaam: string;
  afzenderAdres?: string | null;
  afzenderPostcode?: string | null;
  afzenderPlaats?: string | null;
  afzenderKvk?: string | null;
  afzenderBtwId?: string | null;
  afzenderIban?: string | null;
  afzenderEmail?: string | null;
  klantNaam: string;
  klantAdres?: string | null;
  klantPostcode?: string | null;
  klantPlaats?: string | null;
  klantEmail?: string | null;
  klantKvk?: string | null;
  btwPercentage: number;
  opmerking?: string | null;
  lines: FactuurRegelInput[];
};

async function zzpProfileVoorUser(userId: string) {
  return db.zZPProfile.findUnique({ where: { userId } });
}

/** Context voor het factuurformulier: profiel-voorinvulling, opdrachten en een voorgesteld nummer. */
export async function getFactuurContext(userId: string) {
  const profile = await zzpProfileVoorUser(userId);
  if (!profile) return null;

  const jaar = new Date().getFullYear();
  const aantalDitJaar = await db.zzpInvoice.count({
    where: {
      zzpProfileId: profile.id,
      factuurdatum: {
        gte: new Date(jaar, 0, 1),
        lt: new Date(jaar + 1, 0, 1),
      },
    },
  });
  const voorstelNummer = `${jaar}-${String(aantalDitJaar + 1).padStart(3, "0")}`;

  const assignments = await db.assignment.findMany({
    where: { zzpProfileId: profile.id },
    include: {
      job: { select: { titel: true, gewenstUurtariefCents: true } },
      company: {
        select: { naam: true, kvkNummer: true, regio: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { profile, assignments, voorstelNummer };
}

export async function listFacturen(userId: string) {
  return db.zzpInvoice.findMany({
    where: { zzpProfile: { userId } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFactuur(userId: string, id: string) {
  return db.zzpInvoice.findFirst({
    where: { id, zzpProfile: { userId } },
    include: { lines: { orderBy: { volgorde: "asc" } } },
  });
}

/** Maakt een factuur aan, berekent de bedragen en bewaart afzendergegevens voor de volgende keer. */
export async function createFactuur(
  userId: string,
  input: FactuurInput,
): Promise<string> {
  const profile = await zzpProfileVoorUser(userId);
  if (!profile) throw new Error("Geen zzp-profiel gevonden.");

  const regels = input.lines
    .filter((r) => r.omschrijving.trim().length > 0)
    .map((r, i) => ({
      omschrijving: r.omschrijving.trim(),
      aantal: r.aantal,
      tariefCents: r.tariefCents,
      bedragCents: Math.round(r.aantal * r.tariefCents),
      volgorde: i,
    }));

  if (regels.length === 0) throw new Error("Voeg minstens één regel toe.");

  const subtotaalCents = regels.reduce((s, r) => s + r.bedragCents, 0);
  const btwPercentage = [0, 9, 21].includes(input.btwPercentage)
    ? input.btwPercentage
    : 21;
  const btwCents = Math.round((subtotaalCents * btwPercentage) / 100);
  const totaalCents = subtotaalCents + btwCents;

  const factuur = await db.zzpInvoice.create({
    data: {
      zzpProfileId: profile.id,
      assignmentId: input.assignmentId || null,
      factuurnummer: input.factuurnummer.trim(),
      factuurdatum: input.factuurdatum,
      vervaldatum: input.vervaldatum ?? null,
      afzenderNaam: input.afzenderNaam.trim(),
      afzenderAdres: input.afzenderAdres || null,
      afzenderPostcode: input.afzenderPostcode || null,
      afzenderPlaats: input.afzenderPlaats || null,
      afzenderKvk: input.afzenderKvk || null,
      afzenderBtwId: input.afzenderBtwId || null,
      afzenderIban: input.afzenderIban || null,
      afzenderEmail: input.afzenderEmail || null,
      klantNaam: input.klantNaam.trim(),
      klantAdres: input.klantAdres || null,
      klantPostcode: input.klantPostcode || null,
      klantPlaats: input.klantPlaats || null,
      klantEmail: input.klantEmail || null,
      klantKvk: input.klantKvk || null,
      btwPercentage,
      subtotaalCents,
      btwCents,
      totaalCents,
      opmerking: input.opmerking || null,
      lines: { create: regels },
    },
  });

  // Afzendergegevens onthouden voor de volgende factuur (best-effort).
  try {
    await db.zZPProfile.update({
      where: { id: profile.id },
      data: {
        adres: input.afzenderAdres || profile.adres,
        postcode: input.afzenderPostcode || profile.postcode,
        plaats: input.afzenderPlaats || profile.plaats,
        iban: input.afzenderIban || profile.iban,
        btwId: input.afzenderBtwId || profile.btwId,
      },
    });
  } catch {
    // niet kritiek
  }

  return factuur.id;
}
