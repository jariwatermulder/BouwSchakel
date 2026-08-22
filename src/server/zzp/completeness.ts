/**
 * Berekent de profielcompleetheid (0–100) van een ZZP-profiel.
 *
 * Pure functie, los van Prisma, zodat ze eenvoudig te testen is. De gewichten
 * weerspiegelen wat belangrijk is voor goede matches (zie docs/MATCHING.md):
 * vakgebied en beschikbaarheid wegen zwaarder dan bijv. portfolio.
 */
export interface CompletenessInput {
  voornaam?: string | null;
  achternaam?: string | null;
  telefoon?: string | null;
  over?: string | null;
  jarenErvaring?: number | null;
  uurtariefCents?: number | null;
  werkgebiedPlaats?: string | null;
  maxReisafstandKm?: number | null;
  startdatum?: Date | null;
  skillsCount: number;
  specializationsCount: number;
  certificationsCount: number;
  availabilityCount: number;
  eigenBus: boolean;
  eigenGereedschap: boolean;
  vca: boolean;
}

interface Onderdeel {
  gewicht: number;
  vervuld: (p: CompletenessInput) => boolean;
}

const ONDERDELEN: Onderdeel[] = [
  { gewicht: 12, vervuld: (p) => !!p.voornaam && !!p.achternaam },
  { gewicht: 4, vervuld: (p) => !!p.telefoon },
  { gewicht: 20, vervuld: (p) => p.skillsCount > 0 },
  { gewicht: 6, vervuld: (p) => p.specializationsCount > 0 },
  { gewicht: 8, vervuld: (p) => p.jarenErvaring != null },
  { gewicht: 5, vervuld: (p) => !!p.over },
  { gewicht: 12, vervuld: (p) => (p.uurtariefCents ?? 0) > 0 },
  {
    gewicht: 12,
    vervuld: (p) => !!p.werkgebiedPlaats && (p.maxReisafstandKm ?? 0) > 0,
  },
  {
    gewicht: 12,
    vervuld: (p) => p.availabilityCount > 0 || p.startdatum != null,
  },
  {
    gewicht: 5,
    vervuld: (p) => p.eigenBus || p.eigenGereedschap || p.vca,
  },
  { gewicht: 4, vervuld: (p) => p.certificationsCount > 0 },
];

export function computeCompleteness(input: CompletenessInput): number {
  const totaal = ONDERDELEN.reduce((sum, o) => sum + o.gewicht, 0);
  const behaald = ONDERDELEN.reduce(
    (sum, o) => (o.vervuld(input) ? sum + o.gewicht : sum),
    0,
  );
  return Math.round((behaald / totaal) * 100);
}

/** Minimale drempel waarbij een profiel zichtbaar/matchbaar mag worden. */
export const MIN_ZICHTBAAR_PCT = 60;
