import "server-only";
import type { Prisma, ZzpInvoiceStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { berekenTotalen, regelBedragCents } from "@/lib/factuur";
import { genereerFactuurPdf } from "./pdf";
import { factuurNaarPdfData } from "./mapper";

/**
 * Facturenmodule: zzp'ers én bedrijven maken eigen facturen (opmaken, opslaan,
 * dupliceren, mailen, PDF). Afzender/klant worden als momentopname bewaard;
 * bedragen worden per btw-tarief berekend.
 */

export type FactuurRegelInput = {
  omschrijving: string;
  aantal: number;
  eenheid?: string | null;
  tariefCents: number;
  btwPercentage: number;
};

export type FactuurInput = {
  assignmentId?: string | null;
  factuurnummer: string;
  factuurdatum: Date;
  vervaldatum?: Date | null;
  betaaltermijnDagen?: number | null;
  betaalreferentie?: string | null;
  btwVerlegd: boolean;
  afzenderNaam: string;
  afzenderAdres?: string | null;
  afzenderPostcode?: string | null;
  afzenderPlaats?: string | null;
  afzenderKvk?: string | null;
  afzenderBtwId?: string | null;
  afzenderIban?: string | null;
  afzenderEmail?: string | null;
  afzenderTelefoon?: string | null;
  afzenderWebsite?: string | null;
  klantNaam: string;
  klantContactpersoon?: string | null;
  klantAdres?: string | null;
  klantPostcode?: string | null;
  klantPlaats?: string | null;
  klantEmail?: string | null;
  klantKvk?: string | null;
  klantBtwId?: string | null;
  opmerking?: string | null;
  lines: FactuurRegelInput[];
};

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
    telefoon: string;
    website: string;
  };
  assignments: {
    id: string;
    jobTitel: string;
    tariefEuro: number | null;
    bedrijf: string;
    bedrijfKvk: string;
  }[];
};

function voorstelNummer(jaar: number, aantalDitJaar: number): string {
  return `ZPC-${jaar}-${String(aantalDitJaar + 1).padStart(4, "0")}`;
}

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
  const nummer = voorstelNummer(jaar, aantalDitJaar);

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
      voorstelNummer: nummer,
      afzender: {
        naam,
        adres: p?.adres ?? "",
        postcode: p?.postcode ?? "",
        plaats: p?.plaats ?? "",
        kvk: p?.kvkNummer ?? "",
        btwId: p?.btwId ?? "",
        iban: p?.iban ?? "",
        email,
        telefoon: p?.telefoon ?? "",
        website: "",
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

  const c = await db.company.findUnique({ where: { id: eig.companyId } });
  return {
    kind: "company",
    voorstelNummer: nummer,
    afzender: {
      naam: c?.naam ?? "",
      adres: c?.adres ?? "",
      postcode: c?.postcode ?? "",
      plaats: c?.plaats ?? "",
      kvk: c?.kvkNummer ?? "",
      btwId: c?.btwId ?? "",
      iban: c?.iban ?? "",
      email,
      telefoon: c?.telefoon ?? "",
      website: c?.website ?? "",
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

export type FactuurMetRegels = NonNullable<Awaited<ReturnType<typeof getFactuur>>>;

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

function bewaarAfzender(input: FactuurInput) {
  return {
    adres: input.afzenderAdres || undefined,
    postcode: input.afzenderPostcode || undefined,
    plaats: input.afzenderPlaats || undefined,
    iban: input.afzenderIban || undefined,
    btwId: input.afzenderBtwId || undefined,
  };
}

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
      eenheid: r.eenheid || null,
      tariefCents: r.tariefCents,
      btwPercentage: input.btwVerlegd ? 0 : r.btwPercentage,
      bedragCents: regelBedragCents(r.aantal, r.tariefCents),
      volgorde: i,
    }));
  if (regels.length === 0) throw new Error("Voeg minstens één regel toe.");

  const totalen = berekenTotalen(
    regels.map((r) => ({ bedragCents: r.bedragCents, btwPercentage: r.btwPercentage })),
    input.btwVerlegd,
  );

  const factuur = await db.zzpInvoice.create({
    data: {
      zzpProfileId: eig.kind === "zzp" ? eig.zzpProfileId : null,
      companyId: eig.kind === "company" ? eig.companyId : null,
      assignmentId: eig.kind === "zzp" ? input.assignmentId || null : null,
      factuurnummer: input.factuurnummer.trim(),
      factuurdatum: input.factuurdatum,
      vervaldatum: input.vervaldatum ?? null,
      betaaltermijnDagen: input.betaaltermijnDagen ?? null,
      betaalreferentie: input.betaalreferentie || input.factuurnummer.trim(),
      btwVerlegd: input.btwVerlegd,
      afzenderNaam: input.afzenderNaam.trim(),
      afzenderAdres: input.afzenderAdres || null,
      afzenderPostcode: input.afzenderPostcode || null,
      afzenderPlaats: input.afzenderPlaats || null,
      afzenderKvk: input.afzenderKvk || null,
      afzenderBtwId: input.afzenderBtwId || null,
      afzenderIban: input.afzenderIban || null,
      afzenderEmail: input.afzenderEmail || null,
      afzenderTelefoon: input.afzenderTelefoon || null,
      afzenderWebsite: input.afzenderWebsite || null,
      klantNaam: input.klantNaam.trim(),
      klantContactpersoon: input.klantContactpersoon || null,
      klantAdres: input.klantAdres || null,
      klantPostcode: input.klantPostcode || null,
      klantPlaats: input.klantPlaats || null,
      klantEmail: input.klantEmail || null,
      klantKvk: input.klantKvk || null,
      klantBtwId: input.klantBtwId || null,
      btwPercentage: regels[0]?.btwPercentage ?? 21,
      subtotaalCents: totalen.subtotaalCents,
      btwCents: totalen.btwCents,
      totaalCents: totalen.totaalCents,
      opmerking: input.opmerking || null,
      lines: { create: regels },
    },
  });

  try {
    if (eig.kind === "zzp") {
      await db.zZPProfile.update({ where: { id: eig.zzpProfileId }, data: bewaarAfzender(input) });
    } else {
      await db.company.update({ where: { id: eig.companyId }, data: bewaarAfzender(input) });
    }
  } catch {
    // niet kritiek
  }

  return factuur.id;
}

/** Dupliceert een factuur als nieuw concept met een nieuw nummer en datum. */
export async function dupliceerFactuur(
  userId: string,
  id: string,
): Promise<string | null> {
  const bron = await getFactuur(userId, id);
  if (!bron) return null;

  const jaar = new Date().getFullYear();
  const ownerFilter = bron.zzpProfileId
    ? { zzpProfileId: bron.zzpProfileId }
    : { companyId: bron.companyId };
  const aantalDitJaar = await db.zzpInvoice.count({
    where: {
      ...ownerFilter,
      factuurdatum: { gte: new Date(jaar, 0, 1), lt: new Date(jaar + 1, 0, 1) },
    },
  });
  const nummer = voorstelNummer(jaar, aantalDitJaar);

  const kopie = await db.zzpInvoice.create({
    data: {
      zzpProfileId: bron.zzpProfileId,
      companyId: bron.companyId,
      assignmentId: bron.assignmentId,
      factuurnummer: nummer,
      status: "CONCEPT",
      factuurdatum: new Date(),
      vervaldatum: bron.betaaltermijnDagen
        ? new Date(Date.now() + bron.betaaltermijnDagen * 86400000)
        : bron.vervaldatum,
      betaaltermijnDagen: bron.betaaltermijnDagen,
      betaalreferentie: nummer,
      btwVerlegd: bron.btwVerlegd,
      afzenderNaam: bron.afzenderNaam,
      afzenderAdres: bron.afzenderAdres,
      afzenderPostcode: bron.afzenderPostcode,
      afzenderPlaats: bron.afzenderPlaats,
      afzenderKvk: bron.afzenderKvk,
      afzenderBtwId: bron.afzenderBtwId,
      afzenderIban: bron.afzenderIban,
      afzenderEmail: bron.afzenderEmail,
      afzenderTelefoon: bron.afzenderTelefoon,
      afzenderWebsite: bron.afzenderWebsite,
      klantNaam: bron.klantNaam,
      klantContactpersoon: bron.klantContactpersoon,
      klantAdres: bron.klantAdres,
      klantPostcode: bron.klantPostcode,
      klantPlaats: bron.klantPlaats,
      klantEmail: bron.klantEmail,
      klantKvk: bron.klantKvk,
      klantBtwId: bron.klantBtwId,
      btwPercentage: bron.btwPercentage,
      subtotaalCents: bron.subtotaalCents,
      btwCents: bron.btwCents,
      totaalCents: bron.totaalCents,
      opmerking: bron.opmerking,
      lines: {
        create: bron.lines.map((l) => ({
          omschrijving: l.omschrijving,
          aantal: l.aantal,
          eenheid: l.eenheid,
          tariefCents: l.tariefCents,
          btwPercentage: l.btwPercentage,
          bedragCents: l.bedragCents,
          volgorde: l.volgorde,
        })),
      },
    },
  });
  return kopie.id;
}

export type VerstuurResultaat = { ok: boolean; error?: string };

export async function verstuurFactuur(
  userId: string,
  id: string,
): Promise<VerstuurResultaat> {
  const f = await getFactuur(userId, id);
  if (!f) return { ok: false, error: "Factuur niet gevonden." };
  if (!f.klantEmail) {
    return { ok: false, error: "Vul eerst het e-mailadres van de klant in bij de factuur." };
  }
  if (!process.env.RESEND_API_KEY?.trim()) {
    return {
      ok: false,
      error: "E-mail versturen is nog niet ingesteld (geen e-mailprovider gekoppeld).",
    };
  }

  try {
    const pdf = await genereerFactuurPdf(factuurNaarPdfData(f));
    const base64 = Buffer.from(pdf).toString("base64");
    const bestandsnaam = `factuur-${f.factuurnummer}.pdf`.replace(/[^a-zA-Z0-9.\-]/g, "_");
    await sendEmail({
      to: f.klantEmail,
      subject: `Factuur ${f.factuurnummer} van ${f.afzenderNaam}`,
      text: `Beste ${f.klantContactpersoon || f.klantNaam},\n\nIn de bijlage vindt u factuur ${f.factuurnummer}${
        f.vervaldatum
          ? `, te voldoen vóór ${new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(f.vervaldatum)}`
          : ""
      }.\n\nMet vriendelijke groet,\n${f.afzenderNaam}`,
      attachments: [{ filename: bestandsnaam, content: base64 }],
    });
  } catch (err) {
    console.error("[facturen] versturen mislukt:", err);
    return { ok: false, error: "Versturen mislukt. Probeer het later opnieuw." };
  }

  await db.zzpInvoice.update({ where: { id: f.id }, data: { status: "VERSTUURD" } });
  return { ok: true };
}
