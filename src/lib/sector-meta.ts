import { sectorVan, type Sector } from "@/lib/sectoren";

/**
 * Kleur + icoon per sector. Eén bron van waarheid voor de kleurcodering van
 * opdrachtkaarten, sector-tegels e.d. De iconnamen verwijzen naar
 * components/home/pictos.
 */
export const SECTOR_META: Record<Sector, { kleur: string; icon: string }> = {
  "Bouw & afbouw": { kleur: "#f59e0b", icon: "hammer" },
  "Techniek & installatie": { kleur: "#2563eb", icon: "wrench" },
  Schoonmaak: { kleur: "#06b6d4", icon: "star" },
  "Transport & logistiek": { kleur: "#4f46e5", icon: "truck" },
  "Groen & buiten": { kleur: "#16a34a", icon: "leaf" },
  Horeca: { kleur: "#e11d48", icon: "cup" },
  "Zorg & welzijn": { kleur: "#db2777", icon: "heart" },
  "ICT & digitaal": { kleur: "#7c3aed", icon: "code" },
  "Administratie & office": { kleur: "#0d9488", icon: "folder" },
  "Creatief & marketing": { kleur: "#c026d3", icon: "palette" },
  "Evenementen & beveiliging": { kleur: "#dc2626", icon: "ticket" },
  Overig: { kleur: "#334155", icon: "grid" },
};

/** Kleur + icoon voor een vakgebied op basis van zijn slug. */
export function sectorMetaVan(slug: string): { kleur: string; icon: string } {
  return SECTOR_META[sectorVan(slug)];
}
