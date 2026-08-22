/** Volgorde en labels van de ZZP-registratiestappen. */
export const REGISTRATIE_STAPPEN = [
  { slug: "persoonlijk", label: "Persoonlijke gegevens" },
  { slug: "bedrijf", label: "Bedrijfsgegevens" },
  { slug: "vakgebied", label: "Vakgebied" },
  { slug: "specialisatie", label: "Specialisatie" },
  { slug: "ervaring", label: "Ervaring" },
  { slug: "tarief", label: "Tarief" },
  { slug: "werkgebied", label: "Werkgebied" },
  { slug: "beschikbaarheid", label: "Beschikbaarheid" },
  { slug: "materieel", label: "Materieel" },
  { slug: "certificaten", label: "Certificaten" },
  { slug: "portfolio", label: "Portfolio" },
] as const;

export type StapSlug = (typeof REGISTRATIE_STAPPEN)[number]["slug"];

export function isStapSlug(value: string | undefined): value is StapSlug {
  return REGISTRATIE_STAPPEN.some((s) => s.slug === value);
}

export function volgendeStap(slug: StapSlug): StapSlug | null {
  const index = REGISTRATIE_STAPPEN.findIndex((s) => s.slug === slug);
  const next = REGISTRATIE_STAPPEN[index + 1];
  return next ? next.slug : null;
}
