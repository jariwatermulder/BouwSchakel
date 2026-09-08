import "server-only";
import type { ZzpInvoice, ZzpInvoiceLine } from "@prisma/client";
import type { FactuurPdfData } from "./pdf";

/** Zet een opgeslagen factuur om naar de gegevens die de PDF-generator nodig heeft. */
export function factuurNaarPdfData(
  f: ZzpInvoice & { lines: ZzpInvoiceLine[] },
): FactuurPdfData {
  return {
    factuurnummer: f.factuurnummer,
    status: f.status,
    factuurdatum: f.factuurdatum,
    vervaldatum: f.vervaldatum,
    betaaltermijnDagen: f.betaaltermijnDagen,
    betaalreferentie: f.betaalreferentie,
    btwVerlegd: f.btwVerlegd,
    afzender: {
      naam: f.afzenderNaam,
      adres: f.afzenderAdres,
      postcode: f.afzenderPostcode,
      plaats: f.afzenderPlaats,
      kvk: f.afzenderKvk,
      btwId: f.afzenderBtwId,
      iban: f.afzenderIban,
      email: f.afzenderEmail,
      telefoon: f.afzenderTelefoon,
      website: f.afzenderWebsite,
    },
    klant: {
      naam: f.klantNaam,
      contactpersoon: f.klantContactpersoon,
      adres: f.klantAdres,
      postcode: f.klantPostcode,
      plaats: f.klantPlaats,
      kvk: f.klantKvk,
      btwId: f.klantBtwId,
      email: f.klantEmail,
    },
    regels: f.lines.map((l) => ({
      omschrijving: l.omschrijving,
      aantal: l.aantal,
      eenheid: l.eenheid,
      tariefCents: l.tariefCents,
      btwPercentage: l.btwPercentage,
      bedragCents: l.bedragCents,
    })),
    opmerking: f.opmerking,
  };
}
