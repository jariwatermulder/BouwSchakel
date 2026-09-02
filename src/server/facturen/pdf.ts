import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

/**
 * Genereert een nette factuur-PDF in de ZZP Connect-huisstijl met pdf-lib.
 * Gebruikt de standaard Helvetica-fonts; bedragen als "EUR 1.234,56" zodat er
 * geen problemen zijn met glyph-encoding.
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

const INK = rgb(0.043, 0.071, 0.125); // #0b1220
const NAVY = rgb(0.071, 0.157, 0.267); // #122844
const AMBER = rgb(0.961, 0.62, 0.043); // #f59e0b
const MUTED = rgb(0.4, 0.45, 0.52);
const LINE = rgb(0.86, 0.89, 0.92);
const WHITE = rgb(1, 1, 1);

function bedrag(cents: number): string {
  return (cents / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

/** WinAnsi-veilige tekst: vervangt typografische tekens en strip onbekende glyphs. */
function safe(input: string | null | undefined): string {
  if (!input) return "";
  const vervangen = input
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...");
  let out = "";
  for (const ch of vervangen) {
    out += ch.charCodeAt(0) <= 255 ? ch : "?";
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
  const M = 48; // marge

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
    rightX: number,
    y: number,
    size: number,
    f: PDFFont = font,
    color = INK,
  ) => {
    const w = f.widthOfTextAtSize(safe(s), size);
    page.drawText(safe(s), { x: rightX - w, y, size, font: f, color });
  };

  // ── Kopbalk ────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 96, width, height: 96, color: INK });
  // Logo-blokje
  page.drawRectangle({
    x: M,
    y: height - 70,
    width: 30,
    height: 30,
    color: AMBER,
  });
  text("ZC", M + 7, height - 62, 14, bold, INK);
  text("ZZP Connect", M + 42, height - 62, 16, bold, WHITE);
  rechts("FACTUUR", width - M, height - 52, 22, bold, WHITE);
  rechts(`Nr. ${data.factuurnummer}`, width - M, height - 74, 10, font, rgb(0.8, 0.85, 0.92));

  // ── Afzender + klant ──────────────────────────────────────────────────
  let y = height - 96 - 40;
  const afz = [
    data.afzenderNaam,
    data.afzenderAdres,
    [data.afzenderPostcode, data.afzenderPlaats].filter(Boolean).join(" "),
    data.afzenderEmail,
    data.afzenderKvk ? `KvK: ${data.afzenderKvk}` : "",
    data.afzenderBtwId ? `Btw-id: ${data.afzenderBtwId}` : "",
  ].filter((r) => r && r.length > 0) as string[];

  const klant = [
    data.klantNaam,
    data.klantAdres,
    [data.klantPostcode, data.klantPlaats].filter(Boolean).join(" "),
    data.klantEmail,
    data.klantKvk ? `KvK: ${data.klantKvk}` : "",
  ].filter((r) => r && r.length > 0) as string[];

  text("VAN", M, y, 8, bold, MUTED);
  text("AAN", width / 2, y, 8, bold, MUTED);
  y -= 16;
  const startBlok = y;
  afz.forEach((r, i) => text(r, M, startBlok - i * 14, i === 0 ? 11 : 10, i === 0 ? bold : font, i === 0 ? INK : MUTED));
  klant.forEach((r, i) => text(r, width / 2, startBlok - i * 14, i === 0 ? 11 : 10, i === 0 ? bold : font, i === 0 ? INK : MUTED));

  y = startBlok - Math.max(afz.length, klant.length) * 14 - 24;

  // Datums
  text(`Factuurdatum: ${datum(data.factuurdatum)}`, M, y, 10, font, MUTED);
  if (data.vervaldatum) {
    text(`Vervaldatum: ${datum(data.vervaldatum)}`, width / 2, y, 10, font, MUTED);
  }
  y -= 30;

  // ── Regeltabel ────────────────────────────────────────────────────────
  const colOms = M;
  const colAantal = width - M - 230;
  const colTarief = width - M - 120;
  const colBedrag = width - M;

  page.drawRectangle({
    x: M,
    y: y - 6,
    width: width - 2 * M,
    height: 24,
    color: NAVY,
  });
  text("Omschrijving", colOms + 8, y + 2, 9, bold, WHITE);
  rechts("Aantal", colAantal + 40, y + 2, 9, bold, WHITE);
  rechts("Tarief", colTarief + 60, y + 2, 9, bold, WHITE);
  rechts("Bedrag", colBedrag - 8, y + 2, 9, bold, WHITE);
  y -= 22;

  for (const r of data.lines) {
    y -= 18;
    text(r.omschrijving, colOms + 8, y, 10);
    rechts(
      Number.isInteger(r.aantal) ? String(r.aantal) : r.aantal.toFixed(2),
      colAantal + 40,
      y,
      10,
    );
    rechts(`EUR ${bedrag(r.tariefCents)}`, colTarief + 60, y, 10);
    rechts(`EUR ${bedrag(r.bedragCents)}`, colBedrag - 8, y, 10);
    page.drawLine({
      start: { x: M, y: y - 6 },
      end: { x: width - M, y: y - 6 },
      thickness: 0.5,
      color: LINE,
    });
  }

  // ── Totalen ───────────────────────────────────────────────────────────
  y -= 24;
  const totLabelX = width - M - 200;
  rechts("Subtotaal", totLabelX, y, 10, font, MUTED);
  rechts(`EUR ${bedrag(data.subtotaalCents)}`, colBedrag - 8, y, 10);
  y -= 18;
  rechts(`Btw (${data.btwPercentage}%)`, totLabelX, y, 10, font, MUTED);
  rechts(`EUR ${bedrag(data.btwCents)}`, colBedrag - 8, y, 10);
  y -= 8;
  page.drawLine({
    start: { x: totLabelX - 10, y: y },
    end: { x: width - M, y: y },
    thickness: 1,
    color: INK,
  });
  y -= 20;
  rechts("Totaal", totLabelX, y, 13, bold, INK);
  rechts(`EUR ${bedrag(data.totaalCents)}`, colBedrag - 8, y, 13, bold, INK);

  // ── Betaalinformatie + opmerking ─────────────────────────────────────
  y -= 44;
  if (data.afzenderIban) {
    text("Gelieve te betalen op:", M, y, 10, bold, INK);
    text(`IBAN ${data.afzenderIban}  —  t.n.v. ${data.afzenderNaam}`, M, y - 15, 10, font, MUTED);
    y -= 40;
  }
  if (data.opmerking) {
    text("Opmerking", M, y, 9, bold, MUTED);
    text(data.opmerking, M, y - 14, 10, font, INK);
  }

  // ── Voettekst ─────────────────────────────────────────────────────────
  page.drawLine({
    start: { x: M, y: 66 },
    end: { x: width - M, y: 66 },
    thickness: 0.5,
    color: LINE,
  });
  text(
    "Opgemaakt met ZZP Connect. Deze factuur is een hulpmiddel; controleer zelf de fiscale juistheid.",
    M,
    52,
    8,
    font,
    MUTED,
  );

  return doc.save();
}
