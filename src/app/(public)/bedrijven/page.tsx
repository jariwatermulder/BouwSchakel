import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Voor bedrijven",
  description:
    "Vind snel geverifieerde, beschikbare zzp’ers voor je opdrachten.",
};

const punten = [
  {
    t: "Snel geregeld",
    d: "Plaats een opdracht in ongeveer twee minuten en ontvang direct passende kandidaten.",
  },
  {
    t: "Transparante match",
    d: "Elke kandidaat heeft een matchscore met uitleg — je ziet precies waarom iemand past.",
  },
  {
    t: "Vertrouwen",
    d: "Geverifieerde profielen en reviews van eerdere opdrachtgevers.",
  },
];

const stappen = [
  "Plaats je opdracht: vak, locatie, startdatum en tarief.",
  "Bekijk passende kandidaten met matchscore én uitleg.",
  "Nodig uit, chat en maak direct afspraken.",
];

/** Illustratieve matching-interface: opdracht → match → profiel. */
function MatchMockup() {
  return (
    <div className="w-full max-w-sm space-y-3">
      {/* Opdracht */}
      <div
        className="bs-load border-border bg-surface rounded-xl border p-4 shadow-xl"
        style={{ animationDelay: "260ms" }}
      >
        <span className="bg-accent-500/15 text-accent-600 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold">
          Jouw opdracht
        </span>
        <p className="text-foreground mt-2 font-semibold">Monteur gezocht</p>
        <p className="text-foreground-muted text-sm">
          Utrecht · Start deze week · 3 weken
        </p>
      </div>
      {/* Stap */}
      <div
        className="bs-load flex justify-center"
        style={{ animationDelay: "460ms" }}
      >
        <span className="bg-navy-800 text-accent-400 rounded-full px-3 py-1 text-xs font-medium">
          ↓ Match gevonden
        </span>
      </div>
      {/* Profiel */}
      <div
        className="bs-load bs-float-card border-border bg-surface rounded-xl border p-4 shadow-xl"
        style={{ animationDelay: "660ms" }}
      >
        <div className="flex items-center gap-3">
          <span className="bg-navy-800 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white">
            SD
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground font-semibold">Sander D.</p>
            <p className="text-foreground-muted text-xs">
              Monteur · beschikbaar · 8 km
            </p>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
            96% match
          </span>
        </div>
        <div className="border-border text-foreground-muted mt-3 flex gap-4 border-t pt-3 text-xs">
          <span>★ 4,9</span>
          <span>Geverifieerd</span>
          <span>Reageert snel</span>
        </div>
      </div>
    </div>
  );
}

export default function BedrijvenLandingPage() {
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
                Voor bedrijven
              </Badge>
            </div>
            <h1
              className="bs-load mt-4 text-4xl font-extrabold tracking-tight md:text-5xl"
              style={{ animationDelay: "80ms" }}
            >
              Vind de zzp’er die je nodig hebt.
            </h1>
            <p
              className="text-navy-100 bs-load mt-5 text-lg"
              style={{ animationDelay: "160ms" }}
            >
              Plaats gratis een opdracht en zie meteen geschikte, beschikbare en
              geverifieerde zzp’ers — met een matchscore én uitleg. In elke
              sector.
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
                Plaats een opdracht
              </ButtonLink>
              <ButtonLink
                href="/hoe-het-werkt"
                variant="outline"
                size="lg"
                className="border-navy-700 hover:bg-navy-800 bg-transparent text-white hover:text-white"
              >
                Hoe het werkt
              </ButtonLink>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <MatchMockup />
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
              Vandaag een zzp’er nodig?
            </h2>
            <p className="text-foreground-muted mx-auto mt-3 max-w-xl">
              Plaats gratis een opdracht en ontvang direct passende kandidaten.
            </p>
            <div className="mt-8">
              <ButtonLink
                href="/registreren?rol=bedrijf"
                variant="accent"
                size="lg"
              >
                Plaats een opdracht
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
