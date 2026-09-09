import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { Icon, PersonPortrait } from "@/components/home/pictos";
import { listPublicJobs } from "@/server/jobs/public";
import { sectorMetaVan } from "@/lib/sector-meta";
import { formatEuro } from "@/lib/utils";

export const dynamic = "force-dynamic";

function datumKort(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

const stappen = [
  {
    titel: "Plaats je opdracht of profiel",
    tekst:
      "Kies vakgebied, locatie en tarief. In een paar minuten sta je online.",
    icon: "doc" as const,
  },
  {
    titel: "Ontvang passende matches",
    tekst:
      "Je ziet geschikte, beschikbare zzp’ers — met een matchscore én uitleg.",
    icon: "match" as const,
  },
  {
    titel: "Maak direct contact",
    tekst:
      "Bekijk profielen en maak rechtstreeks afspraken. Geen tussenlaag.",
    icon: "chat" as const,
  },
];

const waarden = [
  {
    titel: "In elke sector",
    tekst: "Van bouw en techniek tot zorg, horeca, transport en IT.",
    icon: "grid" as const,
  },
  {
    titel: "Geverifieerde profielen",
    tekst: "Controle op e-mail, telefoon, KvK en certificaten.",
    icon: "shield" as const,
  },
  {
    titel: "Matchscore met uitleg",
    tekst: "Je ziet altijd waarom iemand past — geen black box.",
    icon: "match" as const,
  },
  {
    titel: "Direct contact",
    tekst: "Rechtstreeks afspraken maken, zonder tussenlaag.",
    icon: "chat" as const,
  },
];

const sectoren = [
  "Bouw & afbouw",
  "Techniek & installatie",
  "Schoonmaak",
  "Transport & logistiek",
  "Groen & buiten",
  "Horeca",
  "Zorg & welzijn",
  "ICT & digitaal",
  "Administratie & office",
  "Creatief & marketing",
];

/** Rustige, statische previewkaart met een paar voorbeeldmatches. */
function PreviewKaart() {
  const rijen = [
    { vak: "Timmerman", plaats: "Groningen", pct: 96 },
    { vak: "Verpleegkundige", plaats: "Zwolle", pct: 93 },
    { vak: "Elektricien", plaats: "Amersfoort", pct: 94 },
  ];
  return (
    <div className="border-border bg-surface shadow-soft w-full max-w-sm rounded-[var(--radius-card)] border p-5">
      <div className="flex items-center justify-between">
        <span className="text-foreground text-sm font-semibold">
          Voorbeeld van matches
        </span>
        <span className="text-foreground-muted text-xs">in elke sector</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {rijen.map((r) => (
          <div
            key={r.vak}
            className="border-border flex items-center gap-3 rounded-2xl border p-3"
          >
            <span className="bg-navy-50 text-navy-600 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
              <Icon name="match" className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-foreground truncate text-sm font-semibold">
                {r.vak}
              </p>
              <p className="text-foreground-muted text-xs">{r.plaats}</p>
            </div>
            <span className="text-accent-600 shrink-0 text-sm font-bold">
              {r.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hero-visual: branded paneel met de twee vakmensen en een previewkaart.
 * Fotoslot: geef een echte foto aan, dan vervangen we dit paneel door een
 * volledige beeld-hero in bndle-stijl.
 */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        aria-hidden
        className="bg-accent-500/20 absolute -inset-6 -z-10 rounded-[2.5rem] blur-2xl"
      />
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-1 pb-4">
          <div className="flex -space-x-3">
            <span className="ring-navy-950 h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2">
              <PersonPortrait variant="opdrachtgever" />
            </span>
            <span className="ring-navy-950 h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2">
              <PersonPortrait variant="zzper" />
            </span>
          </div>
          <p className="text-navy-100 text-sm">
            Opdrachtgever en zzp’er, direct verbonden
          </p>
        </div>
        <PreviewKaart />
      </div>
    </div>
  );
}

export default async function HomePage() {
  const klussen = await listPublicJobs(6);

  return (
    <>
      {/* Hero */}
      <section className="bg-navy-950 relative overflow-hidden text-white">
        <div aria-hidden className="bs-hero-mesh pointer-events-none absolute inset-0" />
        <Container className="relative z-10 grid items-center gap-14 py-16 md:py-24 lg:grid-cols-2">
          <div className="max-w-xl">
            <span className="eyebrow text-accent-400 [&::before]:bg-accent-400">
              Hét platform voor zzp-werk
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              De juiste zzp’er.{" "}
              <span className="text-accent-400">Op het juiste moment.</span>
            </h1>
            <p className="text-navy-100 mt-6 max-w-lg text-lg leading-relaxed">
              Vind gecontroleerde zzp’ers voor elke klus, in elke sector — of
              vind jouw volgende opdracht. Direct contact, zonder tussenlaag.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/registreren?rol=bedrijf" variant="accent" size="lg">
                Ik zoek een zzp’er
              </ButtonLink>
              <ButtonLink
                href="/opdrachten"
                variant="outline"
                size="lg"
                className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Bekijk opdrachten
              </ButtonLink>
            </div>
            <div className="text-navy-100 mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {["Gratis account", "Geen abonnement", "In elke sector"].map(
                (chip) => (
                  <span key={chip} className="inline-flex items-center gap-2">
                    <span
                      aria-hidden
                      className="bg-accent-400/15 text-accent-400 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                    >
                      ✓
                    </span>
                    {chip}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="lg:justify-self-end">
            <HeroVisual />
          </div>
        </Container>
      </section>

      {/* Waardenbalk (eerlijk — geen verzonnen cijfers) */}
      <section className="border-border border-b bg-surface">
        <Container className="grid gap-x-8 gap-y-10 py-10 sm:grid-cols-2 lg:grid-cols-4 md:py-12">
          {waarden.map((w) => (
            <div key={w.titel} className="flex flex-col items-center text-center">
              <span className="bg-accent-500/10 text-accent-600 flex h-12 w-12 items-center justify-center rounded-2xl">
                <Icon name={w.icon} className="h-6 w-6" />
              </span>
              <p className="text-foreground mt-4 font-bold">{w.titel}</p>
              <p className="text-foreground-muted mt-1 text-sm leading-relaxed">
                {w.tekst}
              </p>
            </div>
          ))}
        </Container>
      </section>

      {/* Actuele klussen */}
      <section className="border-border border-b py-16 md:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="eyebrow">Actuele klussen</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Openstaande opdrachten
              </h2>
              <p className="text-foreground-muted mt-3">
                Een greep uit de klussen die nu online staan, in elke sector.
              </p>
            </div>
            <ButtonLink href="/opdrachten" variant="ghost">
              Alle opdrachten →
            </ButtonLink>
          </div>

          {klussen.length === 0 ? (
            <div className="border-border text-foreground-muted mt-8 rounded-[var(--radius-card)] border border-dashed p-10 text-center">
              Er staan op dit moment nog geen openbare opdrachten online.{" "}
              <Link href="/registreren?rol=bedrijf" className="text-accent-600 font-semibold">
                Plaats de eerste opdracht →
              </Link>
            </div>
          ) : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {klussen.map((job, i) => {
                const meta = sectorMetaVan(job.skill.slug);
                return (
                  <li key={job.id}>
                    <Reveal delayMs={Math.min(i, 5) * 70}>
                      <div className="border-border bg-surface flex h-full flex-col rounded-[var(--radius-card)] border p-5">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{
                              backgroundColor: `${meta.kleur}1a`,
                              color: meta.kleur,
                            }}
                          >
                            {job.skill.naam}
                          </span>
                          {job.company.verificatieStatus === "GEVERIFIEERD" ? (
                            <Badge variant="verified">Geverifieerd</Badge>
                          ) : null}
                        </div>

                        <Link
                          href={`/opdrachten/${job.slug}`}
                          className="hover:text-accent-600 mt-3 block font-semibold leading-snug transition-colors"
                        >
                          {job.titel}
                        </Link>

                        <div className="text-foreground-muted mt-3 space-y-1.5 text-sm">
                          <p className="flex items-center gap-2">
                            <Icon name="pin" className="h-4 w-4 shrink-0 opacity-70" />
                            {job.locatiePlaats}
                          </p>
                          <p className="flex items-center gap-2">
                            <Icon name="calendar" className="h-4 w-4 shrink-0 opacity-70" />
                            Start {datumKort(job.startdatum)}
                          </p>
                          {job.gewenstUurtariefCents ? (
                            <p className="flex items-center gap-2">
                              <Icon name="euro" className="h-4 w-4 shrink-0 opacity-70" />
                              {formatEuro(job.gewenstUurtariefCents)} p/u
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-auto pt-5">
                          <ButtonLink
                            href={`/registreren?rol=zzp&opdracht=${job.slug}`}
                            variant="accent"
                            className="w-full"
                          >
                            Op klus reageren
                          </ButtonLink>
                        </div>
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>

      {/* Hoe het werkt */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <span className="eyebrow">Zo werkt het</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              In drie stappen aan de slag
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {stappen.map((stap, i) => (
              <Reveal key={stap.titel} delayMs={i * 90}>
                <div className="border-border bg-surface h-full rounded-[var(--radius-card)] border p-6">
                  <div className="flex items-center justify-between">
                    <span className="bg-navy-50 text-navy-600 flex h-11 w-11 items-center justify-center rounded-xl">
                      <Icon name={stap.icon} className="h-5 w-5" />
                    </span>
                    <span className="text-border text-3xl font-black tabular-nums">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-semibold">{stap.titel}</h3>
                  <p className="text-foreground-muted mt-2 text-sm leading-relaxed">
                    {stap.tekst}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Sectoren */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <span className="eyebrow">Elke sector</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              Voor al het zzp-werk
            </h2>
            <p className="text-foreground-muted mt-3">
              Van bouw en techniek tot zorg, horeca, transport en IT.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2.5">
            {sectoren.map((s) => (
              <span
                key={s}
                className="border-border bg-surface text-foreground rounded-full border px-4 py-2 text-sm font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* Oproep tot actie */}
      <section className="pb-20 md:pb-28">
        <Container>
          <div className="border-border bg-surface-muted rounded-[var(--radius-card)] border px-8 py-12 text-center md:px-14 md:py-16">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              Klaar om te beginnen?
            </h2>
            <p className="text-foreground-muted mx-auto mt-3 max-w-xl">
              Plaats een opdracht of maak een profiel aan. Gratis, in een paar
              minuten.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/registreren?rol=bedrijf" variant="accent" size="lg">
                Ik zoek een zzp’er
              </ButtonLink>
              <ButtonLink href="/registreren?rol=zzp" variant="outline" size="lg">
                Ik zoek een opdracht
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
