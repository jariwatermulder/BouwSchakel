import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";

const vakgebieden = [
  "Timmerman",
  "Elektricien",
  "Monteur",
  "Schoonmaker",
  "Chauffeur",
  "Hovenier",
  "Kok",
  "Verpleegkundige",
  "Softwareontwikkelaar",
  "Administratief medewerker",
  "Online marketeer",
  "Beveiliger",
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
      "Ons systeem toont geschikte, beschikbare zzp’ers met een matchscore én uitleg waarom ze passen.",
  },
  {
    titel: "Maak direct contact",
    tekst:
      "Bekijk profielen, nodig kandidaten uit en maak afspraken. De overeenkomst sluit je rechtstreeks met de zzp’er.",
  },
];

const voordelenBedrijf = [
  "Snel geschikte, beschikbare zzp’ers vinden",
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

/** Subtiel 'connect'-motief op de achtergrond: drie knooppunten die verbinden. */
function ConnectMotief() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 380 280"
      className="absolute top-1/2 left-1/2 hidden w-[540px] max-w-[80%] -translate-x-1/2 -translate-y-1/2 opacity-25 md:block"
    >
      <line x1="60" y1="140" x2="320" y2="86" stroke="#f59e0b" strokeWidth="2" className="bs-dash" />
      <line x1="60" y1="140" x2="300" y2="214" stroke="#f59e0b" strokeWidth="2" className="bs-dash" />
      <line x1="320" y1="86" x2="300" y2="214" stroke="#4f7cc4" strokeWidth="2" className="bs-dash" />
      {/* pulserende ringen */}
      <circle cx="60" cy="140" r="12" fill="none" stroke="#f59e0b" strokeWidth="2" className="bs-ping" />
      <circle cx="320" cy="86" r="10" fill="none" stroke="#ffffff" strokeWidth="2" className="bs-ping" />
      {/* knooppunten */}
      <circle cx="60" cy="140" r="11" fill="#f59e0b" />
      <circle cx="320" cy="86" r="9" fill="#ffffff" />
      <circle cx="300" cy="214" r="9" fill="#ffffff" />
    </svg>
  );
}

/** Illustratieve product-mockup in de hero: opdracht → match. */
function HeroMockup() {
  return (
    <div className="bs-load bs-float-card w-full max-w-sm" style={{ animationDelay: "320ms" }}>
      <div className="border-border bg-surface rounded-2xl border p-5 shadow-2xl">
        {/* Opdracht */}
        <div className="border-border rounded-xl border p-4">
          <span className="bg-accent-500/15 text-accent-600 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold">
            Nieuwe opdracht
          </span>
          <p className="text-foreground mt-2 font-semibold">Timmerman gezocht</p>
          <p className="text-foreground-muted text-sm">
            Groningen · Start maandag · € 40–45 / u
          </p>
        </div>
        {/* Verbinding */}
        <div className="my-2 flex items-center justify-center">
          <span className="bg-navy-800 text-accent-400 rounded-full px-3 py-1 text-xs font-medium">
            ↓ Match gevonden
          </span>
        </div>
        {/* Vakman-match */}
        <div className="border-border rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <span className="bg-navy-800 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white">
              JV
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground font-semibold">Jeroen V.</p>
              <p className="text-foreground-muted text-xs">
                Timmerman · 12 jaar ervaring · beschikbaar
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
              96% match
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink relative overflow-hidden text-white">
        {/* Bewegende sfeerlaag */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="bs-blob bs-float"
            style={{
              background: "var(--color-accent-500)",
              width: "340px",
              height: "340px",
              top: "-90px",
              right: "-40px",
            }}
          />
          <div
            className="bs-blob bs-float2"
            style={{
              background: "var(--color-navy-500)",
              width: "380px",
              height: "380px",
              bottom: "-140px",
              left: "-70px",
            }}
          />
          <ConnectMotief />
        </div>

        <Container className="relative z-10 grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2">
          <div className="max-w-2xl">
            <div className="bs-load" style={{ animationDelay: "0ms" }}>
              <Badge variant="accent" className="bg-navy-800 text-accent-400">
                Hét platform voor zzp-werk
              </Badge>
            </div>
            <h1
              className="bs-load mt-4 text-4xl font-extrabold tracking-tight md:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              De juiste zzp’er.
              <br />
              <span className="text-accent-500">Op het juiste moment.</span>
            </h1>
            <p
              className="text-navy-100 bs-load mt-5 text-lg"
              style={{ animationDelay: "160ms" }}
            >
              Vind gecontroleerde zzp’ers voor elke klus, in elke sector. Of
              vind jouw volgende opdracht.
            </p>
            <div
              className="bs-load mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <ButtonLink
                href="/registreren?rol=bedrijf"
                variant="accent"
                size="lg"
              >
                Ik zoek een zzp’er
              </ButtonLink>
              <ButtonLink
                href="/registreren?rol=zzp"
                variant="outline"
                size="lg"
                className="border-navy-700 hover:bg-navy-800 bg-transparent text-white hover:text-white"
              >
                Ik zoek een opdracht
              </ButtonLink>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroMockup />
          </div>
        </Container>
      </section>

      {/* Hoe het werkt */}
      <section className="py-16 md:py-20">
        <Container>
          <h2 className="text-2xl font-bold md:text-3xl">Hoe het werkt</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {stappen.map((stap, i) => (
              <Reveal key={stap.titel} delayMs={i * 120}>
                <Card className="bs-lift h-full">
                  <div className="bg-navy-800 text-accent-500 flex h-9 w-9 items-center justify-center rounded-full font-bold">
                    {i + 1}
                  </div>
                  <CardTitle className="mt-4">{stap.titel}</CardTitle>
                  <CardDescription>{stap.tekst}</CardDescription>
                </Card>
              </Reveal>
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
          <Reveal>
            <div className="mt-6 flex flex-wrap gap-2">
              {vakgebieden.map((vak) => (
                <span
                  key={vak}
                  className="border-border bg-surface text-foreground hover:border-accent-500 hover:text-accent-600 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:-translate-y-0.5"
                >
                  {vak}
                </span>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Voordelen */}
      <section className="py-16 md:py-20">
        <Container className="grid gap-8 md:grid-cols-2">
          <Reveal>
            <Card className="bs-lift h-full">
              <CardTitle>Voor bedrijven</CardTitle>
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
          </Reveal>

          <Reveal delayMs={120}>
            <Card className="bs-lift h-full">
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
          </Reveal>
        </Container>
      </section>

      {/* Verificatie / vertrouwen */}
      <section className="bg-ink py-16 text-white md:py-20">
        <Container className="max-w-3xl text-center">
          <Reveal>
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
              werk sluit je rechtstreeks met de zzp’er.
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
