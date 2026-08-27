import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const vakgebieden = [
  "Timmerman",
  "Metselaar",
  "Tegelzetter",
  "Schilder",
  "Stukadoor",
  "Loodgieter",
  "Elektricien",
  "Dakdekker",
  "Grondwerker",
  "Voorman / uitvoerder",
];

const stappen = [
  {
    titel: "Plaats je opdracht",
    tekst:
      "Kies vakgebied, locatie, startdatum en tarief. In ongeveer twee minuten staat je opdracht klaar.",
  },
  {
    titel: "Ontvang passende matches",
    tekst:
      "Ons systeem toont geschikte, beschikbare vakmensen met een matchscore én uitleg waarom ze passen.",
  },
  {
    titel: "Maak direct contact",
    tekst:
      "Bekijk profielen, nodig kandidaten uit en maak afspraken. De overeenkomst sluit je rechtstreeks met de vakman.",
  },
];

const voordelenBedrijf = [
  "Snel geschikte, beschikbare ZZP'ers vinden",
  "Geverifieerde profielen en reviews",
  "Matchscore met heldere uitleg — geen black box",
  "Zelf de kandidaat kiezen en direct contact leggen",
];

const voordelenZzp = [
  "Gratis een professioneel profiel opbouwen",
  "Alleen opdrachten die passen bij vak, regio en beschikbaarheid",
  "Zelf je tarief en werkgebied bepalen",
  "Bouw reputatie op met reviews van opdrachtgevers",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink text-white">
        <Container className="py-20 md:py-28">
          <div className="max-w-2xl">
            <Badge variant="accent" className="bg-navy-800 text-accent-400">
              Bemiddelingsplatform voor de bouw
            </Badge>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
              De juiste vakman.
              <br />
              <span className="text-accent-500">Op het juiste moment.</span>
            </h1>
            <p className="text-navy-100 mt-5 text-lg">
              Vind gecontroleerde ZZP&apos;ers voor bouw, renovatie en
              installatie. Of vind jouw volgende opdracht.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/registreren?rol=bedrijf"
                variant="accent"
                size="lg"
              >
                Ik zoek een vakman
              </ButtonLink>
              <ButtonLink
                href="/registreren?rol=zzp"
                variant="outline"
                size="lg"
                className="border-navy-700 hover:bg-navy-800 bg-transparent text-white"
              >
                Ik zoek een opdracht
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Hoe het werkt */}
      <section className="py-16 md:py-20">
        <Container>
          <h2 className="text-2xl font-bold md:text-3xl">Hoe het werkt</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {stappen.map((stap, i) => (
              <Card key={stap.titel}>
                <div className="bg-navy-800 text-accent-500 flex h-9 w-9 items-center justify-center rounded-full font-bold">
                  {i + 1}
                </div>
                <CardTitle className="mt-4">{stap.titel}</CardTitle>
                <CardDescription>{stap.tekst}</CardDescription>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Populaire vakgebieden */}
      <section className="bg-surface-muted py-16 md:py-20">
        <Container>
          <h2 className="text-2xl font-bold md:text-3xl">
            Populaire vakgebieden
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {vakgebieden.map((vak) => (
              <span
                key={vak}
                className="border-border bg-surface text-foreground rounded-full border px-4 py-2 text-sm font-medium"
              >
                {vak}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* Voordelen */}
      <section className="py-16 md:py-20">
        <Container className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardTitle>Voor bouwbedrijven</CardTitle>
            <ul className="mt-4 space-y-2">
              {voordelenBedrijf.map((v) => (
                <li
                  key={v}
                  className="text-foreground-muted flex gap-2 text-sm"
                >
                  <span aria-hidden className="text-accent-600">
                    ✓
                  </span>
                  {v}
                </li>
              ))}
            </ul>
            <ButtonLink
              href="/registreren?rol=bedrijf"
              variant="primary"
              className="mt-6"
            >
              Plaats een opdracht
            </ButtonLink>
          </Card>

          <Card>
            <CardTitle>Voor ZZP&apos;ers</CardTitle>
            <ul className="mt-4 space-y-2">
              {voordelenZzp.map((v) => (
                <li
                  key={v}
                  className="text-foreground-muted flex gap-2 text-sm"
                >
                  <span aria-hidden className="text-accent-600">
                    ✓
                  </span>
                  {v}
                </li>
              ))}
            </ul>
            <ButtonLink
              href="/registreren?rol=zzp"
              variant="primary"
              className="mt-6"
            >
              Maak een profiel
            </ButtonLink>
          </Card>
        </Container>
      </section>

      {/* Verificatie / vertrouwen */}
      <section className="bg-ink py-16 text-white md:py-20">
        <Container className="max-w-3xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Gebouwd op vertrouwen
          </h2>
          <p className="text-navy-100 mt-4">
            Profielen kunnen worden geverifieerd op onder andere e-mail,
            telefoon, KvK en certificaten. Reviews zijn alleen mogelijk na een
            echte opdracht via het platform. Zo weet je met wie je zakendoet.
          </p>
          <p className="text-navy-300 mt-6 text-sm">
            ZZP Connect is een bemiddelingsplatform. De overeenkomst voor het
            werk sluit je rechtstreeks met de vakman.
          </p>
        </Container>
      </section>
    </>
  );
}
