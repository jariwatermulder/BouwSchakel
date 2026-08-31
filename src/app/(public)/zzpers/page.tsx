import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Voor ZZP'ers",
  description:
    "Vind passend werk in elke sector. Maak gratis een professioneel profiel op ZZP Connect.",
};

const punten = [
  {
    t: "Passend werk",
    d: "Ontvang alleen opdrachten die aansluiten bij jouw vak, regio en beschikbaarheid.",
  },
  {
    t: "Jij bepaalt",
    d: "Stel zelf je tarief, werkgebied en maximale reisafstand in.",
  },
  {
    t: "Bouw reputatie",
    d: "Verzamel reviews van opdrachtgevers en verhoog je zichtbaarheid.",
  },
];

const stappen = [
  "Maak in een paar minuten een gratis profiel.",
  "Stel je vak, tarief, werkgebied en beschikbaarheid in.",
  "Ontvang passende opdrachten en reageer met één tik.",
];

/** Illustratieve opdrachtcard vanuit het perspectief van de zzp'er. */
function OpdrachtMockup() {
  return (
    <div
      className="bs-load bs-float-card w-full max-w-sm"
      style={{ animationDelay: "320ms" }}
    >
      <div className="border-border bg-surface rounded-2xl border p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="bg-accent-500/15 text-accent-600 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold">
            Nieuwe opdracht voor jou
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
            92% match
          </span>
        </div>
        <p className="text-foreground mt-3 text-lg font-semibold">
          Elektricien gezocht
        </p>
        <dl className="text-foreground-muted mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt>Locatie</dt>
            <dd className="text-foreground font-medium">Groningen</dd>
          </div>
          <div className="flex justify-between">
            <dt>Start</dt>
            <dd className="text-foreground font-medium">Maandag</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tarief</dt>
            <dd className="text-foreground font-medium">€ 40–45 / u</dd>
          </div>
        </dl>
        <div className="bg-accent-500 text-ink mt-4 rounded-lg py-2 text-center text-sm font-semibold">
          Reageer op deze opdracht
        </div>
      </div>
    </div>
  );
}

export default function ZzpLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink relative overflow-hidden text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="bs-blob bs-float"
            style={{
              background: "var(--color-accent-500)",
              width: "320px",
              height: "320px",
              top: "-90px",
              right: "-40px",
            }}
          />
          <div
            className="bs-blob bs-float2"
            style={{
              background: "var(--color-navy-500)",
              width: "360px",
              height: "360px",
              bottom: "-140px",
              left: "-70px",
            }}
          />
        </div>
        <Container className="relative z-10 grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
          <div className="max-w-xl">
            <div className="bs-load">
              <Badge variant="accent" className="bg-navy-800 text-accent-400">
                Voor ZZP&apos;ers
              </Badge>
            </div>
            <h1
              className="bs-load mt-4 text-4xl font-extrabold tracking-tight md:text-5xl"
              style={{ animationDelay: "80ms" }}
            >
              Vind je volgende klus.
            </h1>
            <p
              className="text-navy-100 bs-load mt-5 text-lg"
              style={{ animationDelay: "160ms" }}
            >
              Gratis een professioneel profiel, opdrachten die echt bij je
              passen, en je houdt je volledige uurtarief. In elke sector, in je
              eigen regio.
            </p>
            <div
              className="bs-load mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <ButtonLink href="/registreren?rol=zzp" variant="accent" size="lg">
                Maak gratis een profiel
              </ButtonLink>
              <ButtonLink
                href="/opdrachten"
                variant="outline"
                size="lg"
                className="border-navy-700 hover:bg-navy-800 bg-transparent text-white hover:text-white"
              >
                Bekijk opdrachten
              </ButtonLink>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <OpdrachtMockup />
          </div>
        </Container>
      </section>

      {/* Voordelen */}
      <section className="py-16 md:py-20">
        <Container>
          <Reveal>
            <h2 className="text-2xl font-bold md:text-3xl">
              Waarom ZZP Connect
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {punten.map((p, i) => (
              <Reveal key={p.t} delayMs={i * 120}>
                <Card interactive className="h-full">
                  <CardTitle>{p.t}</CardTitle>
                  <CardDescription>{p.d}</CardDescription>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Zo werkt het */}
      <section className="bg-surface-muted py-16 md:py-20">
        <Container>
          <Reveal>
            <h2 className="text-2xl font-bold md:text-3xl">Zo werkt het</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {stappen.map((stap, i) => (
              <Reveal key={stap} delayMs={i * 120}>
                <div className="flex gap-3">
                  <span className="bg-navy-800 text-accent-500 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold">
                    {i + 1}
                  </span>
                  <p className="text-foreground-muted pt-1.5 text-sm">{stap}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <Container className="text-center">
          <Reveal>
            <h2 className="text-2xl font-bold md:text-3xl">
              Klaar voor je volgende opdracht?
            </h2>
            <p className="text-foreground-muted mx-auto mt-3 max-w-xl">
              Maak gratis een profiel en ontvang opdrachten die bij je passen.
            </p>
            <div className="mt-8">
              <ButtonLink href="/registreren?rol=zzp" variant="accent" size="lg">
                Maak gratis een profiel
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
