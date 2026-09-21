/**
 * Pure helpers voor KvK-nummers en het KvK Handelsregister (Zoeken API v2).
 * Geen server-only imports, zodat dit in validaties, client-componenten en
 * tests bruikbaar is. Het netwerkdeel staat in src/server/kvk/service.ts.
 */

/** Haalt spaties, punten en streepjes weg: "12 345 678" en "1234.5678" → "12345678". */
export function normaliseerKvk(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/[\s.\-]/g, "");
}

/** Een KvK-nummer bestaat uit precies 8 cijfers (er is geen controlegetal). */
export function isGeldigKvkFormaat(nummer: string): boolean {
  return /^\d{8}$/u.test(nummer) && nummer !== "00000000";
}

export type KvkControle = (
  | { status: "gevonden"; kvkNummer: string; naam: string; plaats: string | null }
  | { status: "niet_gevonden"; kvkNummer: string }
  | { status: "ongeldig"; kvkNummer: string }
  /** De controle is uitgeschakeld, of de KvK-API gaf geen bruikbaar antwoord. */
  | { status: "niet_beschikbaar"; kvkNummer: string }
) & {
  /**
   * True als het antwoord uit de KvK-testomgeving komt (geen eigen sleutel
   * ingesteld). Daar bestaan alleen testnummers, dus een testresultaat telt
   * nooit als echte controle en blokkeert het opslaan niet.
   */
  test?: boolean;
};

/** Blokkeert dit resultaat het opslaan? Alleen een echt "niet gevonden" uit het Handelsregister. */
export function kvkBlokkeert(c: KvkControle): boolean {
  return c.status === "niet_gevonden" && !c.test;
}

/** Eén resultaat uit de KvK Zoeken API v2 (alleen de velden die wij gebruiken). */
interface KvkZoekResultaat {
  kvkNummer?: string;
  naam?: string;
  type?: string;
  adres?: {
    binnenlandsAdres?: { plaats?: string };
    buitenlandsAdres?: { land?: string };
  };
}

interface KvkZoekAntwoord {
  totaal?: number;
  resultaten?: KvkZoekResultaat[];
}

/**
 * Kiest uit het antwoord van de Zoeken API het meest representatieve resultaat
 * voor het gevraagde nummer: eerst de hoofdvestiging, dan de rechtspersoon,
 * anders het eerste resultaat met dat nummer. Geeft null als niets past.
 */
export function kiesKvkResultaat(
  antwoord: unknown,
  kvkNummer: string,
): { naam: string; plaats: string | null } | null {
  if (!antwoord || typeof antwoord !== "object") return null;
  const lijst = (antwoord as KvkZoekAntwoord).resultaten;
  if (!Array.isArray(lijst)) return null;
  const passend = lijst.filter(
    (r) => r && typeof r === "object" && r.kvkNummer === kvkNummer && typeof r.naam === "string" && r.naam.trim() !== "",
  );
  const gekozen =
    passend.find((r) => r.type === "hoofdvestiging") ??
    passend.find((r) => r.type === "rechtspersoon") ??
    passend[0];
  if (!gekozen) return null;
  const plaats = gekozen.adres?.binnenlandsAdres?.plaats?.trim();
  return { naam: gekozen.naam!.trim(), plaats: plaats ? plaats : null };
}

/** Tekst die de gebruiker te zien krijgt bij een controleresultaat. */
export function kvkControleTekst(c: KvkControle): string {
  switch (c.status) {
    case "gevonden":
      return c.test
        ? `Gevonden in de KvK-testomgeving: ${c.naam}${c.plaats ? `, ${c.plaats}` : ""}. (Testmodus: telt niet als echte controle.)`
        : `Gevonden in het Handelsregister: ${c.naam}${c.plaats ? `, ${c.plaats}` : ""}.`;
    case "niet_gevonden":
      return c.test
        ? "Het formaat klopt. Niet gevonden in de KvK-testomgeving (daar bestaan alleen testnummers, bijv. 68750110); je kunt gewoon verdergaan."
        : "Dit KvK-nummer staat niet in het Handelsregister. Controleer het nummer.";
    case "ongeldig":
      return "Een KvK-nummer bestaat uit 8 cijfers.";
    case "niet_beschikbaar":
      return "Het formaat klopt (8 cijfers). Controle bij de KvK is op dit moment niet mogelijk; je kunt gewoon verdergaan.";
  }
}
