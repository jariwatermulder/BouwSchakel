import { BEDRIJFSGEGEVENS_COMPLEET } from "@/lib/bedrijfsgegevens";

/**
 * Melding op juridische pagina's. Toont alleen iets zolang de bedrijfsgegevens
 * (naam, adres, KvK, e-mail) niet zijn ingevuld via de NEXT_PUBLIC_BEDRIJF_*-
 * variabelen — daarna verdwijnt de melding vanzelf. De teksten zelf zijn
 * inhoudelijk uitgewerkt; laat ze vóór livegang door een jurist nalezen.
 */
export function LegalNotice() {
  if (BEDRIJFSGEGEVENS_COMPLEET) return null;
  return (
    <p className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
      <strong>Nog aan te vullen:</strong> de bedrijfsgegevens van de aanbieder
      (naam, adres, KvK-nummer en contact-e-mailadres) ontbreken nog op deze
      pagina. Tot die zijn ingevuld is deze tekst niet definitief.
    </p>
  );
}
