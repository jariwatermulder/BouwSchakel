import "server-only";
import type { Prisma, ZzpInvoiceStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { genereerFactuurPdf, type FactuurPdfData } from "./pdf";

/**
 * Facturenmodule: zzp'ers én bedrijven kunnen eigen facturen opmaken, opslaan,
 * mailen en als PDF downloaden (in ZZP Connect-huisstijl). Afzender- en
 * klantgegevens worden als momentopname op de factuur bewaard.
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

/** Een factuur is van deze gebruiker als hij van zijn zzp-profiel óf zijn bedrijf is. */
function eigenaarWhere(userId: string): Prisma.ZzpInvoiceWhereInput {
  return {
    OR: [
      { zzpProfile: { userId } },
      { company: { members: { some: { userId } } } },
    ],
  };
}

type Eigenaar =
  | { kind: "zzp"; zzpProfileId: string; uurtariefCents: number | null }
  | { kind: "company"; companyId: string };

async function resolveEigenaar(userId: string): Promise<Eigenaar | null> {
  const zzp = await db.zZPProfile.findUnique({ where: { userId } });
  if (zzp) {
    return { kind: "zzp", zzpProfileId: zzp.id, uurtariefCents: zzp.uurtariefCents };
  }
  const lid = await db.companyMember.findFirst({ where: { userId } });
  if (lid) return { kind: "company", companyId: lid.companyId };
  return null;
}

export type FactuurContext = {
  kind: "zzp" | "company";
  voorstelNummer: string;
  afzender: {
    naam: string;
    adres: string;
    postcode: string;
    plaats: string;
    kvk: string;
    btwId: string;
    iban: string;
    email: string;
  };
  assignments: {
    id: string;
    jobTitel: string;
    tariefEuro: number | null;
    bedrijf: string;
    bedrijfKvk: string;
  }[];
};

/** Context voor het factuurformulier: voorinvulling, opdrachten en een voorgesteld nummer. */
export async function getFactuurContext(
  userId: string,
  email: string,
): Promise<FactuurContext | null> {
  const eig = await resolveEigenaar(userId);
  if (!eig) return null;

  const jaar = new Date().getFullYear();
  const ownerFilter =
    eig.kind === "zzp"
      ? { zzpProfileId: eig.zzpProfileId }
      : { companyId: eig.companyId };

  const aantalDitJaar = await db.zzpInvoice.count({
    where: {
      ...ownerFilter,
      factuurdatum: { gte: new Date(jaar, 0, 1), lt: new Date(jaar + 1, 0, 1) },
    },
  });
  const voorstelNummer = `${jaar}-${String(aantalDitJaar + 1).padStart(3, "0")}`;

  if (eig.kind === "zzp") {
    const p = await db.zZPProfile.findUnique({ where: { userId } });
    const assignments = await db.assignment.findMany({
      where: { zzpProfileId: eig.zzpProfileId },
      include: {
        job: { select: { titel: true, gewenstUurtariefCents: true } },
        company: { select: { naam: true, kvkNummer: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const naam =
      p?.bedrijfsnaam?.trim() ||
      [p?.voornaam, p?.achternaam].filter(Boolean).join(" ").trim() ||
      "";
    return {
      kind: "zzp",
      voorstelNummer,
      afzender: {
        naam,
        adres: p?.adres ?? "",
        postcode: p?.postcode ?? "",
        plaats: p?.plaats ?? "",
        kvk: p?.kvkNummer ?? "",
        btwId: p?.btwId ?? "",
        iban: p?.iban ?? "",
        email,
      },
      assignments: assignments.map((a) => ({
        id: a.id,
        jobTitel: a.job.titel,
        tariefEuro:
          a.job.gewenstUurtariefCents != null
            ? a.job.gewenstUurtariefCents / 100
            : eig.uurtariefCents != null
              ? eig.uurtariefCents / 100
              : null,
        bedrijf: a.company.naam,
        bedrijfKvk: a.company.kvkNummer ?? "",
      })),
    };
  }

  // Bedrijf: vrije factuur (geen opdracht-koppeling); prefill uit bedrijfsprofiel.
  const c = await db.company.findUnique({ where: { id: eig.companyId } });
  return {
    kind: "company",
    voorstelNummer,
    afzender: {
      naam: c?.naam ?? "",
      adres: "",
      postcode: "",
      plaats: "",
      kvk: c?.kvkNummer ?? "",
      btwId: "",
      iban: "",
      email,
    },
    assignments: [],
  };
}

export async function listFacturen(userId: string) {
  return db.zzpInvoice.findMany({
    where: eigenaarWhere(userId),
    orderBy: { createdAt: "desc" },
  });
}

export async function getFactuur(userId: string, id: string) {
  return db.zzpInvoice.findFirst({
    where: { id, ...eigenaarWhere(userId) },
    include: { lines: { orderBy: { volgorde: "asc" } } },
  });
}

type FactuurMetRegels = NonNullable<Awaited<ReturnType<typeof getFactuur>>>;

export async function setFactuurStatus(
  userId: string,
  id: string,
  status: ZzpInvoiceStatus,
): Promise<boolean> {
  const res = await db.zzpInvoice.updateMany({
    where: { id, ...eigenaarWhere(userId) },
    data: { status },
  });
  return res.count > 0;
}

/** Maakt een factuur aan, berekent de bedragen en onthoudt afzendergegevens (zzp). */
export async function createFactuur(
  userId: string,
  input: FactuurInput,
): Promise<string> {
  const eig = await resolveEigenaar(userId);
  if (!eig) throw new Error("Geen profiel gevonden.");

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
      zzpProfileId: eig.kind === "zzp" ? eig.zzpProfileId : null,
      companyId: eig.kind === "company" ? eig.companyId : null,
      assignmentId: eig.kind === "zzp" ? input.assignmentId || null : null,
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

  // Afzendergegevens onthouden voor de volgende factuur (alleen zzp-profiel).
  if (eig.kind === "zzp") {
    try {
      await db.zZPProfile.update({
        where: { id: eig.zzpProfileId },
        data: {
          adres: input.afzenderAdres || undefined,
          postcode: input.afzenderPostcode || undefined,
          plaats: input.afzenderPlaats || undefined,
          iban: input.afzenderIban || undefined,
          btwId: input.afzenderBtwId || undefined,
        },
      });
    } catch {
      // niet kritiek
    }
  }

  return factuur.id;
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

/** Mailt de factuur als PDF-bijlage naar de klant en zet de status op VERSTUURD. */
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
