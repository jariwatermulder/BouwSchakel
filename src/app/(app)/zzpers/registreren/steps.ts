/**
 * Registratiestappen voor zzp'ers.
 *
 * `kern` = nodig voor een bruikbaar, zichtbaar profiel bij de eerste
 * registratie. De overige stappen zijn optioneel en kunnen later worden
 * aangevuld via de profielpagina — ze onderbreken de eerste registratie niet.
 */
export const REGISTRATIE_STAPPEN = [
  { slug: "persoonlijk", label: "Naam", kern: true },
  { slug: "bedrijf", label: "KvK & bedrijf", kern: true },
  { slug: "vakgebied", label: "Vakgebied", kern: true },
  { slug: "werkgebied", label: "Plaats & werkgebied", kern: true },
  { slug: "beschikbaarheid", label: "Beschikbaarheid", kern: true },
  { slug: "ervaring", label: "Ervaring & introductie", kern: false },
  { slug: "tarief", label: "Tarief", kern: false },
  { slug: "specialisatie", label: "Specialisatie", kern: false },
  { slug: "materieel", label: "Materieel", kern: false },
  { slug: "certificaten", label: "Certificaten", kern: false },
  { slug: "portfolio", label: "Portfolio", kern: false },
] as const;

export type StapSlug = (typeof REGISTRATIE_STAPPEN)[number]["slug"];

export const KERN_STAPPEN = REGISTRATIE_STAPPEN.filter((s) => s.kern);
export const OPTIONELE_STAPPEN = REGISTRATIE_STAPPEN.filter((s) => !s.kern);

export function isStapSlug(value: string | undefined): value is StapSlug {
  return REGISTRATIE_STAPPEN.some((s) => s.slug === value);
}

export function isKernStap(slug: StapSlug): boolean {
  return REGISTRATIE_STAPPEN.find((s) => s.slug === slug)?.kern ?? false;
}

/** Volgende stap binnen dezelfde groep (kern of optioneel). Null = klaar. */
export function volgendeStap(slug: StapSlug): StapSlug | null {
  const groep = isKernStap(slug) ? KERN_STAPPEN : OPTIONELE_STAPPEN;
  const index = groep.findIndex((s) => s.slug === slug);
  const next = groep[index + 1];
  return next ? next.slug : null;
}
