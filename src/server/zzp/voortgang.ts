import "server-only";
import type { ProfileWithRelations } from "@/server/zzp/profile";
import {
  completenessOnderdelen,
  computeCompleteness,
  MIN_ZICHTBAAR_PCT,
  type OnderdeelStatus,
} from "@/server/zzp/completeness";
import type { Voortgang, VoortgangActie } from "@/lib/voortgang";

export interface ProfielVoortgang extends Voortgang {
  zichtbaar: boolean;
  /** Ontbrekend KvK-nummer blokkeert de zichtbaarheid, los van het percentage. */
  kvkOntbreekt: boolean;
}

function stapHref(stap: OnderdeelStatus["stap"]): string {
  return `/zzpers/registreren?stap=${stap}`;
}

/**
 * Vertaalt een zzp-profiel naar een overzicht van wat er al staat en wat er
 * nog te halen valt, zodat de zzp'er niet zelf hoeft te zoeken.
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
  const ontbrekend: VoortgangActie[] = onderdelen
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

  const zichtbaar = p?.zichtbaar ?? false;
  const kvkOntbreekt = !p?.kvkNummer;

  return {
    pct: p?.profielCompleetheidPct ?? computeCompleteness(input),
    ontbrekend,
    tips,
    blokkade: kvkOntbreekt
      ? {
          tekst:
            "KvK-nummer ontbreekt. Zonder KvK-nummer is je profiel niet zichtbaar, ook niet bij 100%.",
          knop: "KvK-nummer invullen",
          href: "/zzpers/registreren?stap=bedrijf",
        }
      : undefined,
    toelichting: zichtbaar
      ? undefined
      : `Vanaf ${MIN_ZICHTBAAR_PCT}% en met een KvK-nummer word je zichtbaar voor opdrachtgevers.`,
    klaarTekst: "Opdrachtgevers zien een volledig profiel. Houd je beschikbaarheid en tarief actueel.",
    zichtbaar,
    kvkOntbreekt,
  };
}
