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
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.6-3.6" />
      </>
    ),
    euro: (
      <>
        <path d="M17 6.5a6 6 0 1 0 0 11" />
        <path d="M4 10.5h9M4 13.5h8" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.5l3 1.8" />
      </>
    ),
    hammer: (
      <>
        <path d="M14.5 4 20 9.5 17.5 12 12 6.5 14.5 4Z" />
        <path d="M12.8 7.3 4 16v4h4l8.7-8.7" />
      </>
    ),
    wrench: (
      <path d="M20 6.5a3.5 3.5 0 0 1-4.6 4.6L7 19.5 4.5 17l8.4-8.4A3.5 3.5 0 0 1 17.5 4l-2.3 2.3 2 2L20 6.5Z" />
    ),
    truck: (
      <>
        <path d="M3 6h11v9H3z" />
        <path d="M14 9h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.7" />
        <circle cx="17" cy="18" r="1.7" />
      </>
    ),
    leaf: (
      <>
        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z" />
        <path d="M5 19c4-4 7-7 11-9" />
      </>
    ),
    cup: (
      <>
        <path d="M5 8h11v5a5.5 5.5 0 0 1-11 0z" />
        <path d="M16 9h2.5a2 2 0 0 1 0 4H16" />
        <path d="M5 20h11" />
      </>
    ),
    heart: (
      <path d="M12 20s-7-4.4-7-9.4A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7 2.6C19 15.6 12 20 12 20Z" />
    ),
    code: (
      <>
        <path d="M8 8l-4 4 4 4" />
        <path d="M16 8l4 4-4 4" />
        <path d="M13.5 6l-3 12" />
      </>
    ),
    folder: <path d="M3 7h6l2 2h10v9H3z" />,
    palette: (
      <>
        <path d="M12 3a9 9 0 1 0 0 18c1.4 0 1.9-1 1.4-2s.1-2 1.6-2H18a3 3 0 0 0 3-3 8.5 8.5 0 0 0-9-8Z" />
        <circle cx="8" cy="12" r="1" />
        <circle cx="12" cy="8" r="1" />
        <circle cx="16" cy="12" r="1" />
      </>
    ),
    ticket: (
      <>
        <rect x="3" y="7" width="18" height="10" rx="2" />
        <path d="M13 7v10" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
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

/**
 * Origineel, kleurrijk hero-visual: een 'live matches'-bord dat het platform
 * in actie toont. Elke sector heeft een eigen kleur, de matchscores lopen op
 * met een animatie en rondom zweven kleurrijke sector-labels.
 */
function MatchBoard() {
  const rijen = [
    { vak: "Timmerman", plaats: "Groningen", pct: 96, icon: "hammer", kleur: "#f59e0b" },
    { vak: "Verpleegkundige", plaats: "Zwolle", pct: 93, icon: "heart", kleur: "#db2777" },
    { vak: "Softwareontwikkelaar", plaats: "Utrecht", pct: 90, icon: "code", kleur: "#7c3aed" },
  ];
  const chips = [
    { label: "Horeca", kleur: "#e11d48", pos: "-left-3 top-10", delay: "0s" },
    { label: "Transport", kleur: "#4f46e5", pos: "-right-4 top-1/3", delay: "1.2s" },
    { label: "Groen", kleur: "#16a34a", pos: "-left-2 bottom-14", delay: "0.6s" },
  ];
  return (
    <div className="bs-load relative w-full max-w-md" style={{ animationDelay: "260ms" }}>
      {/* Zwevende, kleurrijke sector-labels */}
      {chips.map((c) => (
        <span
          key={c.label}
          aria-hidden
          className={`bs-float-chip shadow-soft absolute z-20 hidden rounded-full px-3 py-1.5 text-xs font-bold text-white sm:inline-flex ${c.pos}`}
          style={{ backgroundColor: c.kleur, animationDelay: c.delay }}
        >
          {c.label}
        </span>
      ))}

      <div className="bs-float-card border-border bg-surface shadow-elevated relative z-10 rounded-[var(--radius-card)] border p-5">
        {/* Kopregel */}
        <div className="flex items-center justify-between">
          <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="bs-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Live matches
          </span>
          <span className="text-foreground-muted text-xs font-medium">
            in elke sector
          </span>
        </div>

        {/* Match-rijen met oplopende score */}
        <div className="mt-4 space-y-2.5">
          {rijen.map((r, i) => (
            <div
              key={r.vak}
              className="bs-load border-border rounded-2xl border p-3"
              style={{ animationDelay: `${360 + i * 150}ms` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${r.kleur}1a`, color: r.kleur }}
                >
                  <Icon name={r.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {r.vak}
                  </p>
                  <p className="text-foreground-muted text-xs">{r.plaats}</p>
                </div>
                <span
                  className="shrink-0 text-sm font-bold"
                  style={{ color: r.kleur }}
                >
                  {r.pct}%
                </span>
              </div>
              <div className="bg-surface-muted mt-2 h-1.5 overflow-hidden rounded-full">
                <div
                  className="bs-fill h-full rounded-full"
                  style={
                    {
                      background: r.kleur,
                      "--bs-w": `${r.pct}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Voettekst: de twee personen blijven in beeld */}
        <div className="bg-surface-muted mt-4 flex items-center gap-3 rounded-2xl p-3">
          <div className="flex -space-x-3">
            <span className="ring-surface h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2">
              <PersonPortrait variant="opdrachtgever" />
            </span>
            <span className="ring-surface h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2">
              <PersonPortrait variant="zzper" />
            </span>
          </div>
          <p className="text-foreground-muted flex-1 text-xs">
            Opdrachtgever en zzp’er direct verbonden
          </p>
          <span className="text-accent-600 text-lg" aria-hidden>
            →
          </span>
        </div>
      </div>
    </div>
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
            <MatchBoard />
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
