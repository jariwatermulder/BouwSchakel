/**
 * Officiële bedrijfsgegevens van de aanbieder van ZZP Schakel. Worden getoond
 * in de juridische pagina's en op de contactpagina.
 *
 * Vul dit ÉÉN keer in met de echte gegevens (KvK-uittreksel) — zolang hier
 * placeholders staan, toont de site een duidelijke "nog aan te vullen"-melding
 * op de juridische pagina's. Verzin hier nooit gegevens.
 */
export const BEDRIJF = {
  naam: process.env.NEXT_PUBLIC_BEDRIJF_NAAM ?? "[Bedrijfsnaam]",
  adres: process.env.NEXT_PUBLIC_BEDRIJF_ADRES ?? "[Straat en huisnummer, postcode en plaats]",
  kvk: process.env.NEXT_PUBLIC_BEDRIJF_KVK ?? "[KvK-nummer]",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "[contact-e-mailadres]",
  telefoon: process.env.NEXT_PUBLIC_CONTACT_TELEFOON ?? null,
  /** Versie/datum van de juridische teksten. */
  voorwaardenVersie: "september 2026",
} as const;

/** True zolang er nog placeholders in de bedrijfsgegevens staan. */
export const BEDRIJFSGEGEVENS_COMPLEET =
  !BEDRIJF.naam.startsWith("[") &&
  !BEDRIJF.adres.startsWith("[") &&
  !BEDRIJF.kvk.startsWith("[") &&
  !BEDRIJF.email.startsWith("[");
