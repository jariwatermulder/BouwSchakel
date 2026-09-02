import "server-only";
import type { ZzpInvoiceStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { genereerFactuurPdf, type FactuurPdfData } from "./pdf";

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

type FactuurMetRegels = NonNullable<Awaited<ReturnType<typeof getFactuur>>>;

/** Zet een factuur (van deze gebruiker) op een nieuwe status. */
export async function setFactuurStatus(
  userId: string,
  id: string,
  status: ZzpInvoiceStatus,
): Promise<boolean> {
  const res = await db.zzpInvoice.updateMany({
    where: { id, zzpProfile: { userId } },
    data: { status },
  });
  return res.count > 0;
}

/** Bouwt de PDF-gegevens uit een opgeslagen factuur. */
export function factuurNaarPdfData(f: FactuurMetRegels): FactuurPdfData {
  return {
    factuurnummer: f.factuurnummer,
    factuurdatum: f.factuurdatum,
    vervaldatum: f.vervaldatum,
    afzenderNaam: f.afzenderNaam,
    afzenderAdres: f.afzenderAdres,
    afzenderPostcode: f.afzenderPostcode,
    afzenderPlaats: f.afzenderPlaats,
    afzenderKvk: f.afzenderKvk,
    afzenderBtwId: f.afzenderBtwId,
    afzenderIban: f.afzenderIban,
    afzenderEmail: f.afzenderEmail,
    klantNaam: f.klantNaam,
    klantAdres: f.klantAdres,
    klantPostcode: f.klantPostcode,
    klantPlaats: f.klantPlaats,
    klantEmail: f.klantEmail,
    klantKvk: f.klantKvk,
    btwPercentage: f.btwPercentage,
    subtotaalCents: f.subtotaalCents,
    btwCents: f.btwCents,
    totaalCents: f.totaalCents,
    opmerking: f.opmerking,
    lines: f.lines,
  };
}

export type VerstuurResultaat = { ok: boolean; error?: string };

/**
 * Mailt de factuur als PDF-bijlage naar de klant en zet de status op VERSTUURD.
 * Verstuurt niets (en wijzigt niets) als er geen klant-e-mail of geen
 * e-mailprovider is ingesteld.
 */
export async function verstuurFactuur(
  userId: string,
  id: string,
): Promise<VerstuurResultaat> {
  const f = await getFactuur(userId, id);
  if (!f) return { ok: false, error: "Factuur niet gevonden." };
  if (!f.klantEmail) {
    return {
      ok: false,
      error: "Vul eerst het e-mailadres van de klant in bij de factuur.",
    };
  }
  if (!process.env.RESEND_API_KEY?.trim()) {
    return {
      ok: false,
      error:
        "E-mail versturen is nog niet ingesteld (geen e-mailprovider gekoppeld).",
    };
  }

  try {
    const pdf = await genereerFactuurPdf(factuurNaarPdfData(f));
    const base64 = Buffer.from(pdf).toString("base64");
    const bestandsnaam = `factuur-${f.factuurnummer}.pdf`.replace(
      /[^a-zA-Z0-9.\-]/g,
      "_",
    );
    await sendEmail({
      to: f.klantEmail,
      subject: `Factuur ${f.factuurnummer} van ${f.afzenderNaam}`,
      text: `Beste ${f.klantNaam},\n\nIn de bijlage vind je factuur ${f.factuurnummer}${
        f.vervaldatum
          ? `, te voldoen vóór ${new Intl.DateTimeFormat("nl-NL", {
              dateStyle: "long",
            }).format(f.vervaldatum)}`
          : ""
      }.\n\nMet vriendelijke groet,\n${f.afzenderNaam}`,
      attachments: [{ filename: bestandsnaam, content: base64 }],
    });
  } catch (err) {
    console.error("[facturen] versturen mislukt:", err);
    return { ok: false, error: "Versturen mislukt. Probeer het later opnieuw." };
  }

  await db.zzpInvoice.update({
    where: { id: f.id },
    data: { status: "VERSTUURD" },
  });
  return { ok: true };
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
