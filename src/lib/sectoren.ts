/**
 * Sector-indeling voor de catalogus. ZZP Connect is sector-breed; vakgebieden
 * worden voor de keuzelijsten gegroepeerd per sector. De koppeling gebeurt op
 * de (stabiele) slug van een vakgebied. Onbekende/nieuw toegevoegde vakgebieden
 * vallen automatisch onder "Overig".
 */

/** Weergavevolgorde van de sectoren in de keuzelijsten. */
export const SECTOR_VOLGORDE = [
  "Bouw & afbouw",
  "Techniek & installatie",
  "Schoonmaak",
  "Transport & logistiek",
  "Groen & buiten",
  "Horeca",
  "Zorg & welzijn",
  "ICT & digitaal",
  "Administratie & office",
  "Creatief & marketing",
  "Evenementen & beveiliging",
  "Overig",
] as const;

export type Sector = (typeof SECTOR_VOLGORDE)[number];

/** Vakgebied-slug → sector. */
export const SKILL_SECTOR: Record<string, Sector> = {
  // Bouw & afbouw
  timmerman: "Bouw & afbouw",
  metselaar: "Bouw & afbouw",
  tegelzetter: "Bouw & afbouw",
  schilder: "Bouw & afbouw",
  stukadoor: "Bouw & afbouw",
  loodgieter: "Bouw & afbouw",
  elektricien: "Bouw & afbouw",
  installateur: "Bouw & afbouw",
  dakdekker: "Bouw & afbouw",
  grondwerker: "Bouw & afbouw",
  stratenmaker: "Bouw & afbouw",
  sloper: "Bouw & afbouw",
  betontimmerman: "Bouw & afbouw",
  voorman: "Bouw & afbouw",
  uitvoerder: "Bouw & afbouw",
  // Techniek & installatie
  monteur: "Techniek & installatie",
  servicetechnicus: "Techniek & installatie",
  lasser: "Techniek & installatie",
  // Schoonmaak
  schoonmaker: "Schoonmaak",
  "specialistische-reiniging": "Schoonmaak",
  // Transport & logistiek
  chauffeur: "Transport & logistiek",
  bezorger: "Transport & logistiek",
  heftruckchauffeur: "Transport & logistiek",
  magazijnmedewerker: "Transport & logistiek",
  // Groen & buiten
  hovenier: "Groen & buiten",
  // Horeca
  kok: "Horeca",
  bediening: "Horeca",
  keukenhulp: "Horeca",
  // Zorg & welzijn
  "verzorgende-ig": "Zorg & welzijn",
  verpleegkundige: "Zorg & welzijn",
  begeleider: "Zorg & welzijn",
  // ICT & digitaal
  softwareontwikkelaar: "ICT & digitaal",
  systeembeheerder: "ICT & digitaal",
  "data-analist": "ICT & digitaal",
  // Administratie & office
  "administratief-medewerker": "Administratie & office",
  secretaresse: "Administratie & office",
  klantenservicemedewerker: "Administratie & office",
  // Creatief & marketing
  "grafisch-vormgever": "Creatief & marketing",
  "fotograaf-videograaf": "Creatief & marketing",
  "online-marketeer": "Creatief & marketing",
  // Evenementen & beveiliging
  beveiliger: "Evenementen & beveiliging",
  evenementmedewerker: "Evenementen & beveiliging",
};

export function sectorVan(slug: string): Sector {
  return SKILL_SECTOR[slug] ?? "Overig";
}

/**
 * Groepeer vakgebieden per sector in de vaste weergavevolgorde. Lege sectoren
 * worden weggelaten. Binnen een sector blijft de aangeleverde volgorde behouden
 * (queries sorteren al op naam).
 */
export function groepeerSkills<T extends { slug: string }>(
  skills: T[],
): { sector: Sector; skills: T[] }[] {
  const perSector = new Map<Sector, T[]>();
  for (const skill of skills) {
    const sector = sectorVan(skill.slug);
    const lijst = perSector.get(sector) ?? [];
    lijst.push(skill);
    perSector.set(sector, lijst);
  }
  return SECTOR_VOLGORDE.filter((s) => perSector.has(s)).map((sector) => ({
    sector,
    skills: perSector.get(sector)!,
  }));
}
