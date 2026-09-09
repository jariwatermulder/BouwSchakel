import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/home/pictos";
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

const kenmerken = [
  {
    titel: "Slimme matching",
    tekst: "Elke match komt met een score en uitleg waarom een zzp’er past.",
    icon: "match" as const,
  },
  {
    titel: "Geverifieerde profielen",
    tekst: "Controle op e-mail, telefoon, KvK en certificaten.",
    icon: "shield" as const,
  },
  {
    titel: "Jij bepaalt je tarief",
    tekst: "Zzp’ers stellen zelf hun uurtarief, vak en werkgebied in.",
    icon: "euro" as const,
  },
  {
    titel: "Direct contact",
    tekst: "Praat en plan rechtstreeks in het platform, zonder tussenlaag.",
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

export default async function HomePage() {
  const klussen = await listPublicJobs(6);

  return (
    <>
      {/* Hero */}
      <section className="bs-hero-aurora text-foreground border-border border-b">
        <Container className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2">
          <div className="max-w-xl">
            <Badge
              variant="accent"
              className="bg-accent-500/15 text-accent-700 border-accent-500/20 border"
            >
              Hét platform voor zzp-werk
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
              De juiste zzp’er.
              <br />
              <span className="text-accent-500">Op het juiste moment.</span>
            </h1>
            <p className="text-foreground-muted mt-5 text-lg">
              Vind gecontroleerde zzp’ers voor elke klus, in elke sector. Of
              vind jouw volgende opdracht.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/registreren?rol=bedrijf" variant="accent" size="lg">
                Ik zoek een zzp’er
              </ButtonLink>
              <ButtonLink href="/registreren?rol=zzp" variant="outline" size="lg">
                Ik zoek een opdracht
              </ButtonLink>
            </div>
            <div className="text-foreground-muted mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {["Gratis account", "Geen abonnement", "In elke sector"].map(
                (chip) => (
                  <span key={chip} className="inline-flex items-center gap-1.5">
                    <span className="text-accent-600" aria-hidden>
                      ✓
                    </span>
                    {chip}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <PreviewKaart />
          </div>
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

      {/* Kenmerken */}
      <section className="bg-surface-muted py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <span className="eyebrow">Waarom ZZP Connect</span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
              Alles voor een goede match op één plek
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {kenmerken.map((k, i) => (
              <Reveal key={k.titel} delayMs={(i % 4) * 80}>
                <div className="h-full">
                  <span className="bg-accent-500/10 text-accent-600 flex h-11 w-11 items-center justify-center rounded-xl">
                    <Icon name={k.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{k.titel}</h3>
                  <p className="text-foreground-muted mt-2 text-sm leading-relaxed">
                    {k.tekst}
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
