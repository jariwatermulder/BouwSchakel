/**
 * Gedeeld model voor "je profiel is X% compleet, dit valt nog te halen".
 * Wordt gevuld door server/zzp/voortgang.ts (zzp-profiel) en
 * server/company/voortgang.ts (bedrijfsprofiel) en getoond door
 * components/voortgang-kaart.tsx.
 */
export interface VoortgangActie {
  id: string;
  label: string;
  /** Wat de gebruiker concreet moet doen. */
  actie: string;
  /** Directe link naar de plek waar dit wordt ingevuld. */
  href: string;
  /** Procentpunten die dit oplevert; null voor tips die niet meetellen. */
  procent: number | null;
}

export interface Voortgang {
  pct: number;
  /** Ontbrekende onderdelen die procenten opleveren, zwaarste eerst. */
  ontbrekend: VoortgangActie[];
  /** Tips die niet meetellen in het percentage maar wel helpen. */
  tips: VoortgangActie[];
  /** Iets dat los van het percentage blokkeert (bijv. ontbrekend KvK-nummer). */
  blokkade?: { tekst: string; knop: string; href: string };
  /** Korte toelichting onder de balk, bijv. wanneer je zichtbaar wordt. */
  toelichting?: string;
  /** Tekst bij 100% (zonder blokkade). */
  klaarTekst: string;
}
