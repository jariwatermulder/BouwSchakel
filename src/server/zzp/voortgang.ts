import "server-only";
import type { ProfileWithRelations } from "@/server/zzp/profile";
import {
  completenessOnderdelen,
  computeCompleteness,
  MIN_ZICHTBAAR_PCT,
  type OnderdeelStatus,
} from "@/server/zzp/completeness";

/** Een concrete vervolgstap voor de zzp'er, met directe link naar de juiste plek. */
export interface VoortgangActie {
  id: string;
  label: string;
  actie: string;
  href: string;
  /** Procentpunten die dit oplevert; null voor tips die niet meetellen. */
  procent: number | null;
}

export interface ProfielVoortgang {
  pct: number;
  minZichtbaarPct: number;
  zichtbaar: boolean;
  /** Ontbrekend KvK-nummer blokkeert de zichtbaarheid, los van het percentage. */
  kvkOntbreekt: boolean;
  /** Onderdelen die nog procenten opleveren, zwaarste eerst. */
  ontbrekend: VoortgangActie[];
  /** Vervulde onderdelen (voor het overzicht). */
  vervuld: OnderdeelStatus[];
  /** Tips die niet meetellen in het percentage maar wel opvallen. */
  tips: VoortgangActie[];
}

function stapHref(stap: OnderdeelStatus["stap"]): string {
  return `/zzpers/registreren?stap=${stap}`;
}

/**
 * Vertaalt een profiel naar een overzicht van wat er al staat en wat er nog
 * te halen valt, zodat de zzp'er niet zelf hoeft te zoeken.
 */
export function berekenVoortgang(p: ProfileWithRelations | null): ProfielVoortgang {
  const input = {
    voornaam: p?.voornaam,
    achternaam: p?.achternaam,
    telefoon: p?.telefoon,
    over: p?.over,
    jarenErvaring: p?.jarenErvaring,
    uurtariefCents: p?.uurtariefCents,
    werkgebiedPlaats: p?.werkgebiedPlaats,
    maxReisafstandKm: p?.maxReisafstandKm,
    startdatum: p?.startdatum,
    // "Anders, namelijk…" telt mee als ingevulde keuze (zoals bij het opslaan).
    skillsCount: (p?.skills.length ?? 0) + (p?.vakgebiedAnders ? 1 : 0),
    specializationsCount:
      (p?.specializations.length ?? 0) + (p?.specialisatieAnders ? 1 : 0),
    certificationsCount:
      (p?.certifications.length ?? 0) + (p?.certificatenAnders ? 1 : 0),
    availabilityCount: p?.availability.length ?? 0,
    eigenBus: p?.eigenBus ?? false,
    eigenGereedschap: p?.eigenGereedschap ?? false,
    vca: p?.vca ?? false,
  };

  const onderdelen = completenessOnderdelen(input);
  const ontbrekend = onderdelen
    .filter((o) => !o.vervuld)
    .sort((a, b) => b.procent - a.procent)
    .map((o) => ({
      id: o.id,
      label: o.label,
      actie: o.actie,
      href: stapHref(o.stap),
      procent: o.procent,
    }));

  const tips: VoortgangActie[] = [];
  if (!p?.fotoKey) {
    tips.push({
      id: "foto",
      label: "Profielfoto",
      actie: "Een duidelijke foto van jezelf wekt vertrouwen bij opdrachtgevers.",
      href: "/zzpers/profiel#profielfoto",
      procent: null,
    });
  }
  if ((p?.portfolio.length ?? 0) === 0) {
    tips.push({
      id: "portfolio",
      label: "Portfolio",
      actie: "Laat een paar afgeronde klussen zien, met foto.",
      href: "/zzpers/registreren?stap=portfolio",
      procent: null,
    });
  }
  if (!p?.bedrijfsnaam) {
    tips.push({
      id: "bedrijfsnaam",
      label: "Bedrijfsnaam",
      actie: "Voeg je bedrijfsnaam toe aan je profiel.",
      href: "/zzpers/registreren?stap=bedrijf",
      procent: null,
    });
  }

  return {
    pct: p?.profielCompleetheidPct ?? computeCompleteness(input),
    minZichtbaarPct: MIN_ZICHTBAAR_PCT,
    zichtbaar: p?.zichtbaar ?? false,
    kvkOntbreekt: !p?.kvkNummer,
    ontbrekend,
    vervuld: onderdelen.filter((o) => o.vervuld),
    tips,
  };
}
