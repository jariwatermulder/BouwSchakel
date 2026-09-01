import * as React from "react";
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
    icon: "doc" as const,
  },
  {
    titel: "Ontvang passende matches",
    tekst:
      "Ons systeem toont geschikte, beschikbare zzp’ers met een matchscore én uitleg waarom ze passen.",
    icon: "match" as const,
  },
  {
    titel: "Maak direct contact",
    tekst:
      "Bekijk profielen, nodig kandidaten uit en maak afspraken. De overeenkomst sluit je rechtstreeks met de zzp’er.",
    icon: "chat" as const,
  },
];

const vertrouwenspunten = [
  {
    titel: "Geverifieerde profielen",
    tekst: "E-mail, telefoon, KvK en certificaten kunnen worden gecontroleerd.",
    icon: "shield" as const,
  },
  {
    titel: "Transparante matchscore",
    tekst: "Elke match komt met een score én uitleg — geen black box.",
    icon: "match" as const,
  },
  {
    titel: "Reviews na echte opdrachten",
    tekst: "Beoordelingen zijn alleen mogelijk na werk via het platform.",
    icon: "star" as const,
  },
  {
    titel: "Direct contact",
    tekst: "Je maakt rechtstreeks afspraken met de zzp’er, zonder tussenlaag.",
    icon: "bolt" as const,
  },
];

/** Compacte lijn-iconen (stroke) voor feature- en vertrouwenskaarten. */
function Icon({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    doc: (
      <>
        <path d="M8 3h6l4 4v14H6V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v4h4" />
        <path d="M9 13h6M9 17h4" />
      </>
    ),
    match: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    chat: (
      <>
        <path d="M4 5h16v11H9l-4 4v-4H4V5Z" />
        <path d="M8 10h8M8 13h5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    star: <path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 15.9 7.4 18.3l.9-5.1L4.5 9.5l5.2-.8L12 4Z" />,
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  };
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

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
      className="absolute top-8 right-8 hidden w-[420px] max-w-[42%] opacity-25 md:block"
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

/**
 * Vlakke portret-illustratie (geen foto van een echt persoon). Twee varianten
 * met een eigen kleur- en haarpalet, zodat opdrachtgever en zzp'er duidelijk
 * verschillende personen zijn.
 */
function PersonPortrait({ variant }: { variant: "opdrachtgever" | "zzper" }) {
  const cfg =
    variant === "opdrachtgever"
      ? {
          bg: "#eef3fb",
          skin: "#f1c9a5",
          hair: "#2b2f38",
          clothing: "#22467f",
          collar: "#1a3763",
          glasses: true,
        }
      : {
          bg: "#fff4e2",
          skin: "#e6b184",
          hair: "#4a3520",
          clothing: "#d97706",
          collar: "#b45309",
          glasses: false,
        };
  const id = variant;
  return (
    <svg viewBox="0 0 160 160" aria-hidden className="h-full w-full">
      <defs>
        <clipPath id={`clip-${id}`}>
          <circle cx="80" cy="80" r="80" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <rect width="160" height="160" fill={cfg.bg} />
        {/* schouders / kleding */}
        <path
          d="M24 160 C24 120 50 106 80 106 C110 106 136 120 136 160 Z"
          fill={cfg.clothing}
        />
        <path d="M66 110 L80 126 L94 110 L88 106 L72 106 Z" fill={cfg.collar} />
        {/* nek */}
        <rect x="70" y="90" width="20" height="22" rx="8" fill={cfg.skin} />
        {/* oren */}
        <circle cx="51" cy="72" r="6" fill={cfg.skin} />
        <circle cx="109" cy="72" r="6" fill={cfg.skin} />
        {/* hoofd */}
        <ellipse cx="80" cy="70" rx="30" ry="33" fill={cfg.skin} />
        {/* haar */}
        <path
          d="M49 68 C46 40 66 29 80 29 C94 29 114 40 111 68 C110 55 99 48 80 48 C61 48 50 55 49 68 Z"
          fill={cfg.hair}
        />
        {/* wenkbrauwen */}
        <path
          d="M64 62 q6 -4 12 0"
          stroke={cfg.hair}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M84 62 q6 -4 12 0"
          stroke={cfg.hair}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        {/* ogen */}
        <circle cx="70" cy="71" r="3" fill="#1f2937" />
        <circle cx="90" cy="71" r="3" fill="#1f2937" />
        {/* glimlach */}
        <path
          d="M70 85 q10 8 20 0"
          stroke="#b0693f"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        {cfg.glasses ? (
          <g stroke="#1f2937" strokeWidth="2.4" fill="none">
            <circle cx="70" cy="71" r="8.5" />
            <circle cx="90" cy="71" r="8.5" />
            <path d="M78.5 71 h3" />
          </g>
        ) : null}
      </g>
      <circle
        cx="80"
        cy="80"
        r="79"
        fill="none"
        stroke="rgba(11,18,32,0.06)"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Illustratieve hero-visual: opdrachtgever en zzp'er die worden gematcht. */
function HeroMockup() {
  return (
    <div
      className="bs-load bs-float-card w-full max-w-sm"
      style={{ animationDelay: "320ms" }}
    >
      <div className="border-border bg-surface shadow-elevated rounded-[var(--radius-card)] border p-5">
        {/* Opdrachtgever */}
        <div className="border-border flex items-center gap-3 rounded-2xl border p-3">
          <span className="ring-border h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1">
            <PersonPortrait variant="opdrachtgever" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground font-semibold">Opdrachtgever</p>
            <p className="text-foreground-muted text-sm">
              Plaatste: “Vakman gezocht”
            </p>
          </div>
          <span className="bg-accent-500/15 text-accent-600 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold">
            Nieuw
          </span>
        </div>
        {/* Verbinding */}
        <div className="my-2 flex items-center justify-center">
          <span className="bg-navy-800 text-accent-400 rounded-full px-3 py-1 text-xs font-medium">
            ↓ 96% match
          </span>
        </div>
        {/* ZZP'er */}
        <div className="border-border flex items-center gap-3 rounded-2xl border p-3">
          <span className="ring-border h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1">
            <PersonPortrait variant="zzper" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-foreground font-semibold">ZZP’er</p>
            <p className="text-foreground-muted text-sm">
              Beschikbaar · past op vak en regio
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
            Match
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ink bs-hero-mesh relative overflow-hidden text-white">
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

      {/* Vertrouwensstrip */}
      <section className="border-border border-b py-14 md:py-16">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {vertrouwenspunten.map((punt, i) => (
              <Reveal key={punt.titel} delayMs={i * 90}>
                <div className="flex gap-4">
                  <span className="bg-accent-500/10 text-accent-600 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon name={punt.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-foreground font-semibold">{punt.titel}</p>
                    <p className="text-foreground-muted mt-1 text-sm">
                      {punt.tekst}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Hoe het werkt */}
      <section className="py-16 md:py-24">
        <Container>
          <span className="eyebrow">Zo werkt het</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
            In drie stappen aan de slag
          </h2>
          <p className="text-foreground-muted mt-3 max-w-2xl">
            Van opdracht plaatsen tot samenwerken — ZZP Connect houdt het
            overzichtelijk en snel.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {stappen.map((stap, i) => (
              <Reveal key={stap.titel} delayMs={i * 120}>
                <Card className="bs-lift h-full">
                  <div className="flex items-center justify-between">
                    <span className="bg-navy-800 text-accent-400 flex h-12 w-12 items-center justify-center rounded-2xl">
                      <Icon name={stap.icon} className="h-6 w-6" />
                    </span>
                    <span className="text-border text-4xl font-black tabular-nums">
                      {i + 1}
                    </span>
                  </div>
                  <CardTitle className="mt-5">{stap.titel}</CardTitle>
                  <CardDescription>{stap.tekst}</CardDescription>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Populaire vakgebieden */}
      <section className="bg-surface-muted py-16 md:py-24">
        <Container>
          <span className="eyebrow">Elke sector</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
            Populaire vakgebieden
          </h2>
          <p className="text-foreground-muted mt-3 max-w-2xl">
            Van bouw en techniek tot zorg, horeca, transport en IT — vind of vul
            elke klus in.
          </p>
          <Reveal>
            <div className="mt-8 flex flex-wrap gap-2.5">
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
      <section className="py-16 md:py-24">
        <Container>
          <span className="eyebrow">Voor beide kanten</span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
            Wat ZZP Connect je oplevert
          </h2>
        </Container>
        <Container className="mt-10 grid gap-8 md:grid-cols-2">
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

      {/* Oproep tot actie */}
      <section className="py-8 md:py-12">
        <Container>
          <Reveal>
            <div className="bg-ink bs-hero-mesh shadow-elevated relative overflow-hidden rounded-[var(--radius-card)] px-8 py-12 text-white md:px-14 md:py-16">
              <div className="relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                <div className="max-w-xl">
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Klaar om te beginnen?
                  </h2>
                  <p className="text-navy-100 mt-3">
                    Plaats een opdracht of maak een profiel aan. Gratis, in een
                    paar minuten.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
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
            </div>
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
