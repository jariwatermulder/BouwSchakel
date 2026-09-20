/**
 * Berekent de profielcompleetheid (0–100) van een ZZP-profiel.
 *
 * Pure functie, los van Prisma, zodat ze eenvoudig te testen is. De gewichten
 * weerspiegelen wat opdrachtgevers het eerst bekijken: vakgebied en
 * beschikbaarheid wegen zwaarder dan bijv. portfolio. De gewichten tellen op
 * tot 100, zodat elk gewicht direct als procentpunt getoond kan worden
 * ("+8%" bij een ontbrekend onderdeel).
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

/** Registratiestap waar een onderdeel wordt ingevuld (zie zzpers/registreren/steps.ts). */
export type OnderdeelStap =
  | "persoonlijk"
  | "vakgebied"
  | "specialisatie"
  | "ervaring"
  | "tarief"
  | "werkgebied"
  | "beschikbaarheid"
  | "materieel"
  | "certificaten";

export interface Onderdeel {
  id: string;
  /** Korte naam van het onderdeel, bijv. "Uurtarief". */
  label: string;
  /** Wat de zzp'er concreet moet doen. */
  actie: string;
  stap: OnderdeelStap;
  gewicht: number;
  vervuld: (p: CompletenessInput) => boolean;
}

export const ONDERDELEN: Onderdeel[] = [
  {
    id: "naam",
    label: "Naam",
    actie: "Vul je voor- en achternaam in.",
    stap: "persoonlijk",
    gewicht: 12,
    vervuld: (p) => !!p.voornaam && !!p.achternaam,
  },
  {
    id: "telefoon",
    label: "Telefoonnummer",
    actie: "Voeg je telefoonnummer toe (niet openbaar zichtbaar).",
    stap: "persoonlijk",
    gewicht: 4,
    vervuld: (p) => !!p.telefoon,
  },
  {
    id: "vakgebied",
    label: "Vakgebied",
    actie: "Kies één of meer vakgebieden waarin je werkt.",
    stap: "vakgebied",
    gewicht: 20,
    vervuld: (p) => p.skillsCount > 0,
  },
  {
    id: "specialisatie",
    label: "Specialisatie",
    actie: "Geef aan waar je binnen je vak in gespecialiseerd bent.",
    stap: "specialisatie",
    gewicht: 6,
    vervuld: (p) => p.specializationsCount > 0,
  },
  {
    id: "ervaring",
    label: "Jaren ervaring",
    actie: "Vul in hoeveel jaar ervaring je hebt.",
    stap: "ervaring",
    gewicht: 8,
    vervuld: (p) => p.jarenErvaring != null,
  },
  {
    id: "over",
    label: "Introductie",
    actie: "Schrijf een korte introductie over jezelf en je werk.",
    stap: "ervaring",
    gewicht: 5,
    vervuld: (p) => !!p.over,
  },
  {
    id: "tarief",
    label: "Uurtarief",
    actie: "Vul je uurtarief in, zodat opdrachtgevers weten waar ze aan toe zijn.",
    stap: "tarief",
    gewicht: 12,
    vervuld: (p) => (p.uurtariefCents ?? 0) > 0,
  },
  {
    id: "werkgebied",
    label: "Plaats en werkgebied",
    actie: "Vul je plaats en maximale reisafstand in.",
    stap: "werkgebied",
    gewicht: 12,
    vervuld: (p) => !!p.werkgebiedPlaats && (p.maxReisafstandKm ?? 0) > 0,
  },
  {
    id: "beschikbaarheid",
    label: "Beschikbaarheid",
    actie: "Geef aan vanaf wanneer of in welke periode je beschikbaar bent.",
    stap: "beschikbaarheid",
    gewicht: 12,
    vervuld: (p) => p.availabilityCount > 0 || p.startdatum != null,
  },
  {
    id: "materieel",
    label: "Materieel",
    actie: "Vink aan of je eigen vervoer, gereedschap of VCA hebt.",
    stap: "materieel",
    gewicht: 5,
    vervuld: (p) => p.eigenBus || p.eigenGereedschap || p.vca,
  },
  {
    id: "certificaten",
    label: "Certificaten",
    actie: "Voeg je certificaten toe.",
    stap: "certificaten",
    gewicht: 4,
    vervuld: (p) => p.certificationsCount > 0,
  },
];

export function computeCompleteness(input: CompletenessInput): number {
  const totaal = ONDERDELEN.reduce((sum, o) => sum + o.gewicht, 0);
  const behaald = ONDERDELEN.reduce(
    (sum, o) => (o.vervuld(input) ? sum + o.gewicht : sum),
    0,
  );
  return Math.round((behaald / totaal) * 100);
}

export interface OnderdeelStatus {
  id: string;
  label: string;
  actie: string;
  stap: OnderdeelStap;
  /** Procentpunten die dit onderdeel oplevert. */
  procent: number;
  vervuld: boolean;
}

/** Status per onderdeel, zodat we kunnen tonen waar de ontbrekende procenten te halen zijn. */
export function completenessOnderdelen(input: CompletenessInput): OnderdeelStatus[] {
  const totaal = ONDERDELEN.reduce((sum, o) => sum + o.gewicht, 0);
  return ONDERDELEN.map((o) => ({
    id: o.id,
    label: o.label,
    actie: o.actie,
    stap: o.stap,
    procent: Math.round((o.gewicht / totaal) * 100),
    vervuld: o.vervuld(input),
  }));
}

/** Minimale drempel waarbij een profiel zichtbaar/matchbaar mag worden. */
export const MIN_ZICHTBAAR_PCT = 60;
