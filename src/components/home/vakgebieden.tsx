import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

/**
 * Homepage-sectie "Vind een vakman per vakgebied": drie kaarten die direct
 * naar de etalage met het juiste vakgebiedfilter leiden (/vind-zzper?vak=…).
 *
 * De cijfers zijn landelijke branchecijfers (aantal bedrijven in Nederland,
 * 2025) van Brookz op basis van CBS. Het zijn géén aantallen aangesloten
 * zzp'ers of profielen; dat staat daarom letterlijk bij elk cijfer.
 * De foto's zijn gegenereerde sfeerbeelden per categorie, geen foto's van
 * aangesloten leden.
 */
const VAKGEBIEDEN = [
  {
    slug: "dakdekker",
    titel: "Daken",
    tekst:
      "Voor dakonderhoud, reparaties en nieuwe dakbedekking. Vind een dakdekker en bespreek rechtstreeks jouw klus.",
    afbeelding: "/images/vakgebieden/dakdekkers.webp",
    alt: "Dakdekker aan het werk op een plat dak.",
    aantal: "6.255",
    eenheid: "dakdekkersbedrijven",
    knop: "Bekijk dakdekkers",
    bron: "https://www.brookz.nl/branche-informatie/dakdekkersbedrijf",
  },
  {
    slug: "timmerman",
    titel: "Timmerwerk en renovatie",
    tekst:
      "Van kozijnen en houtwerk tot een verbouwing. Vind een timmerman en bespreek wat je wilt laten maken.",
    afbeelding: "/images/vakgebieden/timmermannen.webp",
    alt: "Timmerman meet een houten balk bij een verbouwing.",
    aantal: "26.260",
    eenheid: "timmerbedrijven",
    knop: "Bekijk timmermannen",
    bron: "https://www.brookz.nl/branche-informatie/timmerbedrijf",
  },
  {
    slug: "loodgieter",
    titel: "Loodgieterswerk en sanitair",
    tekst:
      "Hulp nodig met leidingen, een lekkage of sanitair? Vind een loodgieter en leg rechtstreeks contact.",
    afbeelding: "/images/vakgebieden/loodgieters.webp",
    alt: "Loodgieter werkt aan de aansluiting van een wastafel.",
    aantal: "10.750",
    eenheid: "loodgietersbedrijven",
    knop: "Bekijk loodgieters",
    bron: "https://www.brookz.nl/branche-informatie/loodgietersbedrijf",
  },
] as const;

export function Vakgebieden() {
  return (
    <section
      aria-labelledby="vakgebieden-titel"
      className="bg-surface-muted py-10 md:py-[72px]"
    >
      <Container>
        <div className="max-w-2xl">
          <h2
            id="vakgebieden-titel"
            className="text-3xl font-bold md:text-4xl md:leading-[2.625rem]"
          >
            Vind een vakman per vakgebied
          </h2>
          <p className="text-foreground-muted mt-3 text-lg leading-relaxed">
            Kies een vakgebied en ontdek wie bij jouw klus past.
          </p>
        </div>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-10">
          {VAKGEBIEDEN.map((v) => (
            <li key={v.slug} className="flex">
              {/* Buitenste laag = 1px rand; binnenste laag = witte kaart. Beide met
                  dezelfde diagonaal afgesneden hoeken (rechtsboven, linksonder). */}
              <article className="vg-hoek bg-border hover:bg-navy-300 flex w-full transition-colors duration-200">
                <div className="vg-hoek bg-surface m-px flex w-full flex-col">
                  <div className="relative aspect-[3/2] w-full overflow-hidden">
                    <Image
                      src={v.afbeelding}
                      alt={v.alt}
                      fill
                      sizes="(min-width: 1024px) 368px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl font-bold leading-tight">{v.titel}</h3>
                    <p className="text-foreground-muted mt-3 text-base leading-relaxed md:text-[17px]">
                      {v.tekst}
                    </p>

                    <p className="mt-5 text-lg leading-snug">
                      <strong className="text-foreground text-2xl font-bold tabular-nums">
                        {v.aantal}
                      </strong>{" "}
                      <span className="text-foreground font-medium">{v.eenheid}</span>
                    </p>
                    <p className="text-foreground-muted mt-1 text-sm font-medium">
                      In Nederland · 2025
                    </p>
                    <p className="text-foreground-muted mt-1 text-sm leading-snug">
                      Landelijk branchecijfer, geen aantal aangesloten profielen.
                    </p>
                    <p className="mt-1 text-xs">
                      <a
                        href={v.bron}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground-muted hover:text-brand-700 rounded-sm underline decoration-1 underline-offset-2"
                      >
                        Bron: Brookz, op basis van CBS
                      </a>
                    </p>

                    <div className="border-border mt-auto border-t pt-5">
                      <div className="mt-1">
                        <ButtonLink
                          href={`/vind-zzper?vak=${v.slug}`}
                          variant="brand"
                          className="h-12 w-full rounded-xl text-base"
                        >
                          {v.knop}
                          <span aria-hidden>→</span>
                        </ButtonLink>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
