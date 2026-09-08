import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { berekenTotalen, effectieveStatus, STATUS_META } from "@/lib/factuur";

/**
 * Premium, zakelijke A4-factuur (pdf-lib). Ondersteunt meerdere btw-tarieven,
 * btw verlegd, lange omschrijvingen (word-wrap) en meerdere pagina's met een
 * herhaalde tabelkop. Visueel gelijk aan het scherm-factuurdocument.
 */

type Regel = {
  omschrijving: string;
  aantal: number;
  eenheid: string | null;
  tariefCents: number;
  btwPercentage: number;
  bedragCents: number;
};

export type FactuurPdfData = {
  factuurnummer: string;
  status: string;
  factuurdatum: Date;
  vervaldatum: Date | null;
  betaaltermijnDagen: number | null;
  betaalreferentie: string | null;
  btwVerlegd: boolean;
  afzender: {
    naam: string;
    adres: string | null;
    postcode: string | null;
    plaats: string | null;
    kvk: string | null;
    btwId: string | null;
    iban: string | null;
    email: string | null;
    telefoon: string | null;
    website: string | null;
  };
  klant: {
    naam: string;
    contactpersoon: string | null;
    adres: string | null;
    postcode: string | null;
    plaats: string | null;
    kvk: string | null;
    btwId: string | null;
    email: string | null;
  };
  regels: Regel[];
  opmerking: string | null;
};

const INK = rgb(0.05, 0.09, 0.16);
const MUTED = rgb(0.42, 0.47, 0.54);
const HAIR = rgb(0.9, 0.92, 0.94);
const SOFT = rgb(0.97, 0.98, 0.99);
const AMBER = rgb(0.961, 0.62, 0.043);

const A4 = { w: 595.28, h: 841.89 };
const M = 48;
const RIGHT = A4.w - M;
const BODEM = 96; // ruimte onderaan voor voettekst

function euro(cents: number): string {
  return `€ ${(cents / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
function dkort(d: Date | null): string {
  return d ? new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d) : "—";
}
function dlang(d: Date | null): string {
  return d ? new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d) : "";
}
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

// Kolomposities
const COL = {
  oms: M,
  aantalR: M + 292,
  eenheidL: M + 300,
  tariefR: M + 398,
  btwR: M + 452,
  bedragR: RIGHT,
};
const OMS_BREEDTE = 270;

export async function genereerFactuurPdf(data: FactuurPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([A4.w, A4.h]);
  let y = 0;

  const T = (
    p: PDFPage,
    s: string,
    x: number,
    yy: number,
    size: number,
    f: PDFFont = font,
    color = INK,
  ) => p.drawText(safe(s), { x, y: yy, size, font: f, color });
  const R = (
    p: PDFPage,
    s: string,
    rx: number,
    yy: number,
    size: number,
    f: PDFFont = font,
    color = INK,
  ) => {
    const w = f.widthOfTextAtSize(safe(s), size);
    p.drawText(safe(s), { x: rx - w, y: yy, size, font: f, color });
  };
  const hair = (p: PDFPage, yy: number) =>
    p.drawLine({ start: { x: M, y: yy }, end: { x: RIGHT, y: yy }, thickness: 1, color: HAIR });

  function wrap(text: string, size: number, maxW: number): string[] {
    const woorden = safe(text).split(/\s+/).filter(Boolean);
    if (woorden.length === 0) return ["—"];
    const regels: string[] = [];
    let huidig = "";
    for (const w of woorden) {
      const test = huidig ? `${huidig} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) > maxW && huidig) {
        regels.push(huidig);
        huidig = w;
      } else {
        huidig = test;
      }
    }
    if (huidig) regels.push(huidig);
    return regels;
  }

  function tabelkop(p: PDFPage, yy: number): number {
    T(p, "OMSCHRIJVING", COL.oms, yy, 8, bold, MUTED);
    R(p, "AANTAL", COL.aantalR, yy, 8, bold, MUTED);
    T(p, "EENHEID", COL.eenheidL, yy, 8, bold, MUTED);
    R(p, "TARIEF", COL.tariefR, yy, 8, bold, MUTED);
    R(p, "BTW", COL.btwR, yy, 8, bold, MUTED);
    R(p, "BEDRAG", COL.bedragR, yy, 8, bold, MUTED);
    hair(p, yy - 8);
    return yy - 24;
  }

  function nieuwePagina(): void {
    page = doc.addPage([A4.w, A4.h]);
    page.drawRectangle({ x: 0, y: A4.h - 6, width: A4.w, height: 6, color: AMBER });
    y = A4.h - 64;
    y = tabelkop(page, y);
  }

  // ── Pagina 1: accentbalk + kop ────────────────────────────────────────
  page.drawRectangle({ x: 0, y: A4.h - 6, width: A4.w, height: 6, color: AMBER });
  y = A4.h - 58;
  page.drawRectangle({ x: M, y: y - 20, width: 26, height: 26, color: INK });
  T(page, "ZC", M + 6, y - 12, 12, bold, AMBER);
  T(page, "ZZP Connect", M + 36, y - 12, 14, bold, INK);
  R(page, "FACTUUR", RIGHT, y - 8, 24, bold, INK);
  const eff = effectieveStatus(data.status, data.vervaldatum);
  const statusLabel = (STATUS_META[eff] ?? STATUS_META.CONCEPT!).label;
  R(page, statusLabel.toUpperCase(), RIGHT, y - 26, 9, bold, MUTED);

  // Meta-strip
  y -= 56;
  hair(page, y + 14);
  const meta: [string, string][] = [
    ["FACTUURNUMMER", data.factuurnummer],
    ["FACTUURDATUM", dkort(data.factuurdatum)],
    ["VERVALDATUM", dkort(data.vervaldatum)],
    ["BETAALTERMIJN", data.betaaltermijnDagen ? `${data.betaaltermijnDagen} dagen` : "—"],
  ];
  const cellW = (RIGHT - M) / meta.length;
  meta.forEach(([label, waarde], i) => {
    const x = M + i * cellW;
    T(page, label, x, y, 7.5, bold, MUTED);
    T(page, waarde, x, y - 14, 10, bold, INK);
  });
  hair(page, y - 26);

  // Van / Factuur aan
  y -= 50;
  const colAan = M + (RIGHT - M) / 2 + 8;
  const vanRegels = [
    data.afzender.naam,
    data.afzender.adres,
    [data.afzender.postcode, data.afzender.plaats].filter(Boolean).join(" "),
    data.afzender.email,
    data.afzender.telefoon,
    data.afzender.website,
    data.afzender.kvk ? `KvK ${data.afzender.kvk}` : "",
    data.afzender.btwId ? `BTW ${data.afzender.btwId}` : "",
    data.afzender.iban ? `IBAN ${data.afzender.iban}` : "",
  ].filter((r): r is string => Boolean(r && r.length));
  const aanRegels = [
    data.klant.naam,
    data.klant.contactpersoon ? `T.a.v. ${data.klant.contactpersoon}` : "",
    data.klant.adres,
    [data.klant.postcode, data.klant.plaats].filter(Boolean).join(" "),
    data.klant.email,
    data.klant.kvk ? `KvK ${data.klant.kvk}` : "",
    data.klant.btwId ? `BTW ${data.klant.btwId}` : "",
  ].filter((r): r is string => Boolean(r && r.length));

  T(page, "VAN", M, y, 7.5, bold, MUTED);
  T(page, "FACTUUR AAN", colAan, y, 7.5, bold, MUTED);
  y -= 16;
  const blokStart = y;
  vanRegels.forEach((r, i) => T(page, r, M, blokStart - i * 13, i === 0 ? 11 : 9.5, i === 0 ? bold : font, i === 0 ? INK : MUTED));
  aanRegels.forEach((r, i) => T(page, r, colAan, blokStart - i * 13, i === 0 ? 11 : 9.5, i === 0 ? bold : font, i === 0 ? INK : MUTED));
  y = blokStart - Math.max(vanRegels.length, aanRegels.length) * 13 - 22;

  // ── Tabel ─────────────────────────────────────────────────────────────
  y = tabelkop(page, y);
  for (const r of data.regels) {
    const lijnen = wrap(r.omschrijving, 10, OMS_BREEDTE);
    const rowH = Math.max(18, lijnen.length * 13 + 6);
    if (y - rowH < BODEM) nieuwePagina();
    let ly = y;
    lijnen.forEach((ln) => {
      T(page, ln, COL.oms, ly, 10, font, INK);
      ly -= 13;
    });
    R(page, Number.isInteger(r.aantal) ? String(r.aantal) : r.aantal.toFixed(2), COL.aantalR, y, 10, font, MUTED);
    T(page, r.eenheid ?? "—", COL.eenheidL, y, 10, font, MUTED);
    R(page, euro(r.tariefCents), COL.tariefR, y, 10, font, MUTED);
    R(page, data.btwVerlegd ? "verlegd" : `${r.btwPercentage}%`, COL.btwR, y, 10, font, MUTED);
    R(page, euro(r.bedragCents), COL.bedragR, y, 10, font, INK);
    y -= rowH;
    page.drawLine({ start: { x: M, y: y + 4 }, end: { x: RIGHT, y: y + 4 }, thickness: 0.5, color: HAIR });
  }

  // ── Totalen (nieuwe pagina indien te weinig ruimte) ──────────────────
  const totalen = berekenTotalen(
    data.regels.map((r) => ({ bedragCents: r.bedragCents, btwPercentage: r.btwPercentage })),
    data.btwVerlegd,
  );
  const totRegels = 2 + (data.btwVerlegd ? 1 : Math.max(1, totalen.btwGroepen.length));
  const nodig = totRegels * 18 + 120;
  if (y - nodig < BODEM) {
    page = doc.addPage([A4.w, A4.h]);
    page.drawRectangle({ x: 0, y: A4.h - 6, width: A4.w, height: 6, color: AMBER });
    y = A4.h - 72;
  }

  y -= 18;
  const labelX = RIGHT - 150;
  R(page, "Subtotaal excl. btw", labelX, y, 10, font, MUTED);
  R(page, euro(totalen.subtotaalCents), COL.bedragR, y, 10, font, INK);
  y -= 18;
  if (data.btwVerlegd) {
    R(page, "BTW verlegd", labelX, y, 10, font, MUTED);
    R(page, euro(0), COL.bedragR, y, 10, font, INK);
    y -= 18;
  } else if (totalen.btwGroepen.length === 0) {
    R(page, "BTW", labelX, y, 10, font, MUTED);
    R(page, euro(0), COL.bedragR, y, 10, font, INK);
    y -= 18;
  } else {
    for (const g of totalen.btwGroepen) {
      R(page, `BTW ${g.percentage}%`, labelX, y, 10, font, MUTED);
      R(page, euro(g.btwCents), COL.bedragR, y, 10, font, INK);
      y -= 18;
    }
  }
  page.drawLine({ start: { x: labelX - 10, y: y + 4 }, end: { x: RIGHT, y: y + 4 }, thickness: 1.5, color: INK });
  y -= 18;
  R(page, "Totaal te betalen", labelX, y, 13, bold, INK);
  R(page, euro(totalen.totaalCents), COL.bedragR, y, 13, bold, INK);

  // ── Betalingsinformatie ───────────────────────────────────────────────
  y -= 40;
  const boxH = 62 + (data.opmerking ? 16 : 0);
  page.drawRectangle({ x: M, y: y - boxH, width: RIGHT - M, height: boxH, color: SOFT });
  page.drawRectangle({ x: M, y: y - boxH, width: 3, height: boxH, color: AMBER });
  let by = y - 16;
  T(page, "BETALINGSINFORMATIE", M + 14, by, 7.5, bold, MUTED);
  by -= 15;
  const zin = `Te betalen ${euro(totalen.totaalCents)}${
    data.vervaldatum ? ` vóór ${dlang(data.vervaldatum)}` : ""
  } o.v.v. ${data.betaalreferentie || data.factuurnummer}.`;
  T(page, zin, M + 14, by, 9.5, font, INK);
  by -= 14;
  if (data.afzender.iban) {
    T(page, `IBAN ${data.afzender.iban}  ·  t.n.v. ${data.afzender.naam}`, M + 14, by, 9.5, font, MUTED);
    by -= 14;
  }
  if (data.btwVerlegd) {
    T(page, "BTW verlegd naar de afnemer.", M + 14, by, 9.5, font, MUTED);
    by -= 14;
  }
  if (data.opmerking) {
    T(page, data.opmerking, M + 14, by, 9.5, font, MUTED);
  }

  // ── Voettekst op elke pagina ─────────────────────────────────────────
  const paginas = doc.getPages();
  paginas.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 60 }, end: { x: RIGHT, y: 60 }, thickness: 0.5, color: HAIR });
    T(p, "ZZP Connect", M, 46, 8, bold, MUTED);
    R(
      p,
      `Pagina ${i + 1} van ${paginas.length}  ·  Opgemaakt met ZZP Connect`,
      RIGHT,
      46,
      8,
      font,
      MUTED,
    );
  });

  return doc.save();
}
