import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

/**
 * Genereert een rustige, overzichtelijke factuur-PDF (pdf-lib, Helvetica).
 * Veel witruimte, lichte hairlines en één subtiel accent (het logo).
 */

type Regel = {
  omschrijving: string;
  aantal: number;
  tariefCents: number;
  bedragCents: number;
};

export type FactuurPdfData = {
  factuurnummer: string;
  factuurdatum: Date;
  vervaldatum: Date | null;
  afzenderNaam: string;
  afzenderAdres: string | null;
  afzenderPostcode: string | null;
  afzenderPlaats: string | null;
  afzenderKvk: string | null;
  afzenderBtwId: string | null;
  afzenderIban: string | null;
  afzenderEmail: string | null;
  klantNaam: string;
  klantAdres: string | null;
  klantPostcode: string | null;
  klantPlaats: string | null;
  klantEmail: string | null;
  klantKvk: string | null;
  btwPercentage: number;
  subtotaalCents: number;
  btwCents: number;
  totaalCents: number;
  opmerking: string | null;
  lines: Regel[];
};

const INK = rgb(0.05, 0.09, 0.16);
const MUTED = rgb(0.42, 0.47, 0.54);
const HAIR = rgb(0.9, 0.92, 0.94);
const AMBER = rgb(0.961, 0.62, 0.043);

function bedrag(cents: number): string {
  return `€ ${(cents / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function korteDatum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

/** WinAnsi-veilige tekst (staat het euroteken toe). */
function safe(input: string | null | undefined): string {
  if (!input) return "";
  const v = input
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...");
  let out = "";
  for (const ch of v) {
    const c = ch.charCodeAt(0);
    out += c <= 255 || c === 0x20ac ? ch : "?";
  }
  return out;
}

export async function genereerFactuurPdf(
  data: FactuurPdfData,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const M = 56;
  const right = width - M;

  const text = (
    s: string,
    x: number,
    y: number,
    size: number,
    f: PDFFont = font,
    color = INK,
  ) => page.drawText(safe(s), { x, y, size, font: f, color });

  const rechts = (
    s: string,
    rx: number,
    y: number,
    size: number,
    f: PDFFont = font,
    color = INK,
  ) => {
    const w = f.widthOfTextAtSize(safe(s), size);
    page.drawText(safe(s), { x: rx - w, y, size, font: f, color });
  };

  const hairline = (y: number) =>
    page.drawLine({
      start: { x: M, y },
      end: { x: right, y },
      thickness: 1,
      color: HAIR,
    });

  // ── Kop: logo links, "Factuur" rechts ─────────────────────────────────
  let y = height - M;
  page.drawRectangle({ x: M, y: y - 24, width: 24, height: 24, color: AMBER });
  text("ZC", M + 5, y - 17, 11, bold, INK);
  text("ZZP Connect", M + 34, y - 17, 12, bold, INK);
  rechts("Factuur", right, y - 20, 26, bold, INK);

  y -= 44;
  rechts(`Nr. ${data.factuurnummer}`, right, y, 10, font, MUTED);
  y -= 14;
  rechts(`Datum  ${korteDatum(data.factuurdatum)}`, right, y, 10, font, MUTED);
  if (data.vervaldatum) {
    y -= 14;
    rechts(`Vervalt  ${korteDatum(data.vervaldatum)}`, right, y, 10, font, MUTED);
  }

  // ── Van / Aan ─────────────────────────────────────────────────────────
  const yBlok = height - M - 52;
  const colAan = M + (width - 2 * M) / 2 + 10;

  const regelsVan = [
    data.afzenderAdres,
    [data.afzenderPostcode, data.afzenderPlaats].filter(Boolean).join(" "),
    data.afzenderEmail,
    data.afzenderKvk ? `KvK ${data.afzenderKvk}` : "",
    data.afzenderBtwId ? `Btw-id ${data.afzenderBtwId}` : "",
  ].filter((r): r is string => Boolean(r && r.length));

  const regelsAan = [
    data.klantAdres,
    [data.klantPostcode, data.klantPlaats].filter(Boolean).join(" "),
    data.klantEmail,
    data.klantKvk ? `KvK ${data.klantKvk}` : "",
  ].filter((r): r is string => Boolean(r && r.length));

  const blok = (
    label: string,
    naam: string,
    regels: string[],
    x: number,
  ) => {
    let yy = yBlok;
    text(label, x, yy, 8, bold, MUTED);
    yy -= 18;
    text(naam, x, yy, 12, bold, INK);
    yy -= 16;
    for (const r of regels) {
      text(r, x, yy, 10, font, MUTED);
      yy -= 14;
    }
    return yy;
  };

  const eindVan = blok("VAN", data.afzenderNaam, regelsVan, M);
  const eindAan = blok("AAN", data.klantNaam, regelsAan, colAan);
  y = Math.min(eindVan, eindAan) - 18;

  // ── Regeltabel (licht, zonder gekleurde vlakken) ──────────────────────
  const colBedrag = right;
  const colTarief = right - 95;
  const colAantal = right - 175;

  text("OMSCHRIJVING", M, y, 8, bold, MUTED);
  rechts("AANTAL", colAantal, y, 8, bold, MUTED);
  rechts("TARIEF", colTarief, y, 8, bold, MUTED);
  rechts("BEDRAG", colBedrag, y, 8, bold, MUTED);
  y -= 10;
  hairline(y);
  y -= 22;

  for (const r of data.lines) {
    text(r.omschrijving, M, y, 10, font, INK);
    rechts(
      Number.isInteger(r.aantal) ? String(r.aantal) : r.aantal.toFixed(2),
      colAantal,
      y,
      10,
      font,
      MUTED,
    );
    rechts(bedrag(r.tariefCents), colTarief, y, 10, font, MUTED);
    rechts(bedrag(r.bedragCents), colBedrag, y, 10, font, INK);
    y -= 24;
  }

  // ── Totalen ───────────────────────────────────────────────────────────
  y -= 2;
  const labelX = right - 150;
  hairline(y + 12);
  y -= 6;
  rechts("Subtotaal", labelX, y, 10, font, MUTED);
  rechts(bedrag(data.subtotaalCents), colBedrag, y, 10, font, INK);
  y -= 18;
  rechts(`Btw ${data.btwPercentage}%`, labelX, y, 10, font, MUTED);
  rechts(bedrag(data.btwCents), colBedrag, y, 10, font, INK);
  y -= 20;
  rechts("Totaal", labelX, y, 12, bold, INK);
  rechts(bedrag(data.totaalCents), colBedrag, y, 12, bold, INK);

  // ── Betaalgegevens + opmerking ────────────────────────────────────────
  y -= 52;
  if (data.afzenderIban) {
    text("BETAALGEGEVENS", M, y, 8, bold, MUTED);
    y -= 16;
    text(
      `IBAN ${data.afzenderIban}  ·  t.n.v. ${data.afzenderNaam}`,
      M,
      y,
      10,
      font,
      INK,
    );
    y -= 8;
  }
  if (data.opmerking) {
    y -= 18;
    text(data.opmerking, M, y, 10, font, MUTED);
  }

  // ── Voettekst ─────────────────────────────────────────────────────────
  hairline(60);
  page.drawRectangle({ x: M, y: 44, width: 12, height: 12, color: AMBER });
  text("ZZP Connect", M + 18, 46, 8, bold, MUTED);
  rechts(
    "Hulpmiddel — controleer zelf de fiscale juistheid.",
    right,
    46,
    8,
    font,
    MUTED,
  );

  return doc.save();
}
