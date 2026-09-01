import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/home/pictos";
import { HeroBoard } from "@/components/home/hero-board";

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

const sectoren = [
  { naam: "Bouw & afbouw", icon: "hammer" as const, kleur: "#f59e0b" },
  { naam: "Techniek & installatie", icon: "wrench" as const, kleur: "#2563eb" },
  { naam: "Schoonmaak", icon: "star" as const, kleur: "#06b6d4" },
  { naam: "Transport & logistiek", icon: "truck" as const, kleur: "#4f46e5" },
  { naam: "Groen & buiten", icon: "leaf" as const, kleur: "#16a34a" },
  { naam: "Horeca", icon: "cup" as const, kleur: "#e11d48" },
  { naam: "Zorg & welzijn", icon: "heart" as const, kleur: "#db2777" },
  { naam: "ICT & digitaal", icon: "code" as const, kleur: "#7c3aed" },
  { naam: "Administratie & office", icon: "folder" as const, kleur: "#0d9488" },
  { naam: "Creatief & marketing", icon: "palette" as const, kleur: "#c026d3" },
  { naam: "Evenementen & beveiliging", icon: "ticket" as const, kleur: "#dc2626" },
  { naam: "En meer", icon: "grid" as const, kleur: "#334155" },
];

const features = [
  {
    titel: "Slimme matching",
    tekst: "Elke match komt met een score én uitleg waarom een zzp’er past.",
    icon: "match" as const,
  },
  {
    titel: "Geverifieerde profielen",
    tekst: "Controle mogelijk op e-mail, telefoon, KvK en certificaten.",
    icon: "shield" as const,
  },
  {
    titel: "Jij bepaalt je tarief",
    tekst: "Zzp’ers stellen zelf hun uurtarief, vak en werkgebied in.",
    icon: "euro" as const,
  },
  {
    titel: "Direct contact & chat",
    tekst: "Praat en plan rechtstreeks in het platform, zonder tussenlaag.",
    icon: "chat" as const,
  },
  {
    titel: "Snel geregeld",
    tekst: "In een paar minuten staat je opdracht online of je profiel compleet.",
    icon: "clock" as const,
  },
  {
    titel: "In elke sector",
    tekst: "Bouw, techniek, zorg, horeca, transport, IT en veel meer.",
    icon: "grid" as const,
  },
];

const faqs = [
  {
    vraag: "Wat kost ZZP Connect?",
    antwoord:
      "Een account aanmaken en een profiel opbouwen is gratis. Bekijk de actuele voorwaarden op de tarievenpagina.",
  },
  {
    vraag: "Voor welke sectoren is het platform bedoeld?",
    antwoord:
      "Voor al het zzp-werk — van bouw en techniek tot zorg, horeca, transport, administratie, creatief werk en IT.",
  },
  {
    vraag: "Hoe werkt de matching?",
    antwoord:
      "Op basis van vakgebied, specialisatie, locatie, beschikbaarheid en de gevraagde vereisten. Je ziet altijd een matchscore mét uitleg — geen black box.",
  },
  {
    vraag: "Met wie sluit ik de overeenkomst?",
    antwoord:
      "ZZP Connect is een bemiddelingsplatform. De overeenkomst voor het werk sluit je rechtstreeks met de zzp’er.",
  },
  {
    vraag: "Hoe weet ik of een profiel betrouwbaar is?",
    antwoord:
      "Profielen kunnen worden geverifieerd en reviews zijn alleen mogelijk na een echte opdracht via het platform. Zo weet je met wie je zakendoet.",
  },
  {
    vraag: "Kan ik het op mijn telefoon gebruiken?",
    antwoord:
      "Ja. ZZP Connect werkt als web-app die je met één tik op je startscherm zet — geen app-store nodig.",
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

/** Stilistische telefoon met een mini-overzicht van opdrachten. */
function PhoneMock() {
  const items = [
    { vak: "Timmerman", plaats: "Groningen", tag: "96%" },
    { vak: "Schoonmaker", plaats: "Assen", tag: "91%" },
    { vak: "Chauffeur C", plaats: "Leeuwarden", tag: "88%" },
  ];
  return (
    <div className="bs-float-card border-ink/10 bg-ink shadow-elevated relative mx-auto w-[260px] rounded-[2.2rem] border-8 p-3">
      <div className="bg-ink absolute top-2 left-1/2 h-5 w-24 -translate-x-1/2 rounded-b-2xl" />
      <div className="bg-surface overflow-hidden rounded-[1.6rem]">
        <div className="bg-navy-800 flex items-center justify-between px-4 py-3 text-white">
          <span className="text-sm font-bold">ZZP Connect</span>
          <span className="bg-accent-500 text-ink flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black">
            ZC
          </span>
        </div>
        <div className="space-y-2 p-3">
          <p className="text-foreground-muted px-1 text-xs font-semibold">
            Nieuwe matches
          </p>
          {items.map((it) => (
            <div
              key={it.vak}
              className="border-border flex items-center gap-2 rounded-xl border p-2.5"
            >
              <span className="bg-navy-800 text-accent-400 flex h-8 w-8 items-center justify-center rounded-lg">
                <Icon name="match" className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-semibold">
                  {it.vak}
                </p>
                <p className="text-foreground-muted text-xs">{it.plaats}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                {it.tag}
              </span>
            </div>
          ))}
          <div className="bg-accent-500 text-ink mt-1 rounded-xl py-2 text-center text-sm font-semibold">
            Bekijk opdracht
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
            <div
              className="bs-load text-navy-200 mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm"
              style={{ animationDelay: "320ms" }}
            >
              {["Gratis account", "Geen abonnement", "In elke sector"].map(
                (chip) => (
                  <span key={chip} className="inline-flex items-center gap-1.5">
                    <span className="text-accent-400" aria-hidden>
                      ✓
                    </span>
                    {chip}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroBoard />
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

      {/* Waarom ZZP Connect */}
      <section className="bg-surface-muted py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <span className="eyebrow">Waarom ZZP Connect</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
              Alles voor een goede match op één plek
            </h2>
            <p className="text-foreground-muted mt-3">
              Van slimme matching tot verificatie en directe communicatie —
              overzichtelijk en zonder gedoe.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.titel} delayMs={(i % 3) * 100}>
                <Card className="bs-lift h-full">
                  <span className="bg-accent-500/10 text-accent-600 flex h-11 w-11 items-center justify-center rounded-xl">
                    <Icon name={f.icon} className="h-5 w-5" />
                  </span>
                  <CardTitle className="mt-4 text-lg">{f.titel}</CardTitle>
                  <CardDescription>{f.tekst}</CardDescription>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Sectoren + populaire vakgebieden */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <span className="eyebrow">Elke sector</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
              Voor al het zzp-werk
            </h2>
            <p className="text-foreground-muted mt-3">
              Van bouw en techniek tot zorg, horeca, transport en IT — vind of
              vul elke klus in.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {sectoren.map((s, i) => (
              <Reveal key={s.naam} delayMs={(i % 4) * 80}>
                <ButtonLink
                  href="/opdrachten"
                  variant="outline"
                  className="bs-lift border-border bg-surface hover:border-navy-300 h-auto w-full justify-start gap-3 rounded-[var(--radius-card)] px-4 py-4 font-semibold"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${s.kleur}1a`, color: s.kleur }}
                  >
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-left text-sm leading-tight">
                    {s.naam}
                  </span>
                </ButtonLink>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-10">
              <p className="text-foreground-muted text-sm font-semibold">
                Populair op dit moment
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {vakgebieden.map((vak) => (
                  <span
                    key={vak}
                    className="border-border bg-surface text-foreground hover:border-accent-500 hover:text-accent-600 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:-translate-y-0.5"
                  >
                    {vak}
                  </span>
                ))}
              </div>
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

      {/* App / op je telefoon */}
      <section className="bg-surface-muted overflow-hidden py-16 md:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div className="max-w-xl">
            <span className="eyebrow">Altijd bij de hand</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
              ZZP Connect op je telefoon
            </h2>
            <p className="text-foreground-muted mt-3">
              Zet ZZP Connect met één tik op je startscherm en werk als een
              echte app — nieuwe matches, berichten en opdrachten altijd binnen
              handbereik. Geen app-store nodig.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "Meldingen bij nieuwe, passende matches",
                "Chat direct met opdrachtgevers en zzp’ers",
                "Werkt op elke telefoon, tablet en laptop",
              ].map((v) => (
                <li key={v} className="text-foreground-muted flex gap-2 text-sm">
                  <span aria-hidden className="text-accent-600">
                    ✓
                  </span>
                  {v}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <ButtonLink href="/registreren" variant="accent" size="lg">
                Gratis aan de slag
              </ButtonLink>
            </div>
          </div>
          <Reveal>
            <div className="flex justify-center lg:justify-end">
              <PhoneMock />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Veelgestelde vragen */}
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <div className="text-center">
            <span className="eyebrow justify-center">Veelgestelde vragen</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
              Goed om te weten
            </h2>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.vraag} delayMs={(i % 3) * 80}>
                <details className="border-border bg-surface shadow-soft rounded-2xl border p-5 open:[&_svg]:rotate-45">
                  <summary className="text-foreground flex cursor-pointer items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {f.vraag}
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      className="text-accent-600 h-5 w-5 shrink-0 transition-transform duration-200"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p className="text-foreground-muted mt-3 text-sm leading-relaxed">
                    {f.antwoord}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
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
