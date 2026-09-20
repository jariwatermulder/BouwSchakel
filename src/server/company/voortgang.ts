import "server-only";
import type { Company } from "@prisma/client";
import type { Voortgang, VoortgangActie } from "@/lib/voortgang";

/**
 * Compleetheid van het bedrijfsprofiel van een opdrachtgever. Gewichten
 * tellen op tot 100, zodat elk gewicht direct als procentpunt getoond kan
 * worden. Elk onderdeel linkt naar het bijbehorende veld in het
 * bedrijfsprofielformulier.
 */
interface BedrijfOnderdeel {
  id: string;
  label: string;
  actie: string;
  veld: string;
  gewicht: number;
  vervuld: (c: Company) => boolean;
}

const ONDERDELEN: BedrijfOnderdeel[] = [
  {
    id: "naam",
    label: "Bedrijfsnaam",
    actie: "Vul de naam van je bedrijf in; zzp'ers zien direct wie hen benadert.",
    veld: "naam",
    gewicht: 20,
    vervuld: (c) => c.naam.trim() !== "",
  },
  {
    id: "kvk",
    label: "KvK-nummer",
    actie: "Vul je KvK-nummer in (8 cijfers).",
    veld: "kvkNummer",
    gewicht: 20,
    vervuld: (c) => !!c.kvkNummer,
  },
  {
    id: "contactpersoon",
    label: "Contactpersoon",
    actie: "Wie is het aanspreekpunt voor zzp'ers?",
    veld: "contactpersoon",
    gewicht: 12,
    vervuld: (c) => !!c.contactpersoon,
  },
  {
    id: "regio",
    label: "Regio",
    actie: "In welke regio zoek je vakmensen?",
    veld: "regio",
    gewicht: 12,
    vervuld: (c) => !!c.regio,
  },
  {
    id: "telefoon",
    label: "Telefoonnummer",
    actie: "Voeg een telefoonnummer toe zodat een zzp'er je kan terugbellen.",
    veld: "telefoon",
    gewicht: 10,
    vervuld: (c) => !!c.telefoon,
  },
  {
    id: "typeWerkzaamheden",
    label: "Type werkzaamheden",
    actie: "Omschrijf kort welk soort werk je uitbesteedt.",
    veld: "typeWerkzaamheden",
    gewicht: 10,
    vervuld: (c) => !!c.typeWerkzaamheden,
  },
  {
    id: "omschrijving",
    label: "Bedrijfsomschrijving",
    actie: "Vertel in een paar zinnen wat je bedrijf doet.",
    veld: "omschrijving",
    gewicht: 10,
    vervuld: (c) => !!c.omschrijving,
  },
  {
    id: "website",
    label: "Website",
    actie: "Voeg je website toe, zodat zzp'ers je bedrijf kunnen bekijken.",
    veld: "website",
    gewicht: 6,
    vervuld: (c) => !!c.website,
  },
];

export function berekenBedrijfVoortgang(company: Company | null): Voortgang {
  const totaal = ONDERDELEN.reduce((s, o) => s + o.gewicht, 0);
  const ontbrekend: VoortgangActie[] = ONDERDELEN.filter(
    (o) => !company || !o.vervuld(company),
  )
    .sort((a, b) => b.gewicht - a.gewicht)
    .map((o) => ({
      id: o.id,
      label: o.label,
      actie: o.actie,
      href: `/bedrijven/registreren#${o.veld}`,
      procent: Math.round((o.gewicht / totaal) * 100),
    }));
  const behaald = totaal - ontbrekend.reduce((s, o) => s + (o.procent ?? 0), 0);

  const naamOfKvkOntbreekt = ontbrekend.some((o) => o.id === "naam" || o.id === "kvk");

  return {
    pct: Math.max(0, Math.min(100, behaald)),
    ontbrekend,
    tips: [],
    blokkade: naamOfKvkOntbreekt
      ? {
          tekst:
            "Bedrijfsnaam en KvK-nummer zijn verplicht. Zonder deze gegevens kun je geen profielen bekijken of contact opnemen.",
          knop: "Bedrijfsprofiel afmaken",
          href: "/bedrijven/registreren",
        }
      : undefined,
    toelichting: naamOfKvkOntbreekt
      ? undefined
      : "Een compleet bedrijfsprofiel geeft zzp'ers vertrouwen en levert sneller een reactie op.",
    klaarTekst: "Zzp'ers zien precies met wie ze te maken hebben. Houd je gegevens actueel.",
  };
}
