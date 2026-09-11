import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";
import {
  listPublicJobs,
  countPublicJobs,
  type PublicJob,
} from "@/server/jobs/public";
import { countPublicZzpers } from "@/server/zzpers/directory";
import { SECTOR_META } from "@/lib/sector-meta";
import { sectorVan, SECTOR_VOLGORDE, type Sector } from "@/lib/sectoren";
import { formatEuro } from "@/lib/utils";

export const dynamic = "force-dynamic";

const HERO_FOTO = "/images/hero-samenwerking.jpg";

function datumKort(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(d);
}

function tariefLabel(cents: number | null): string {
  return cents ? `${formatEuro(cents)}/u` : "Op aanvraag";
}

/* ─────────────────────────── Herbruikbare stukjes ─────────────────────────── */

/** Opdrachtkaart met sector-thumbnail (kleur + icoon i.p.v. foto). */
function OpdrachtKaart({ job }: { job: PublicJob }) {
  const meta = SECTOR_META[sectorVan(job.skill.slug)];
  return (
    <Link
      href={`/opdrachten/${job.slug}`}
      className="group border-border bg-surface hover:border-brand-500/40 hover:shadow-soft flex gap-4 rounded-2xl border p-4 transition"
    >
      <span
        className="relative hidden h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:flex"
        style={{ backgroundColor: meta.kleur }}
      >
        <span className="absolute inset-0 bg-black/10" />
        <Icon name={meta.icon} className="relative h-8 w-8 text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <span className="bg-brand-50 text-brand-700 rounded-md px-2 py-0.5 text-xs font-semibold">
            {job.skill.naam}
          </span>
          <span className="text-foreground shrink-0 text-sm font-bold">
            {tariefLabel(job.gewenstUurtariefCents)}
          </span>
        </div>
        <p className="text-foreground group-hover:text-brand-700 mt-2 truncate font-semibold transition-colors">
          {job.titel}
        </p>
        <p className="text-foreground-muted mt-1 truncate text-sm">
          {job.company.naam}
        </p>
        <div className="text-foreground-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="pin" className="h-3.5 w-3.5 opacity-70" />
            {job.locatiePlaats}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="calendar" className="h-3.5 w-3.5 opacity-70" />
            {datumKort(job.startdatum)}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Sector-tegel met kleurvlak, icoon-watermerk en aantal opdrachten. */
function SectorTegel({
  sector,
  aantal,
}: {
  sector: Sector;
  aantal: number;
}) {
  const meta = SECTOR_META[sector];
  return (
    <Link
      href="/opdrachten"
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-3xl p-4 text-white shadow-soft transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none"
      style={{ backgroundColor: meta.kleur }}
    >
      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
      <Icon
        name={meta.icon}
        className="absolute -top-3 -right-3 h-24 w-24 text-white/15 transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none"
      />
      <div className="relative">
        <p className="font-semibold leading-tight">{sector}</p>
        <p className="text-white/80 text-sm">
          {aantal} {aantal === 1 ? "opdracht" : "opdrachten"}
        </p>
      </div>
    </Link>
  );
}

/* ─────────────────────────────── Pagina ─────────────────────────────── */

export default async function HomePage() {
  const [jobs, totaalOpdrachten, aantalProfessionals] = await Promise.all([
    listPublicJobs(200),
    countPublicJobs(),
    countPublicZzpers(),
  ]);

  const recente = jobs.slice(0, 6);
  const featured = jobs[0];

  const perSector = new Map<Sector, number>();
  for (const j of jobs) {
    const s = sectorVan(j.skill.slug);
    perSector.set(s, (perSector.get(s) ?? 0) + 1);
  }
  const sectorTegels = SECTOR_VOLGORDE.filter(
    (s) => perSector.has(s) && s !== "Overig",
  ).map((s) => ({ sector: s, aantal: perSector.get(s)! }));

  const stats = [
    { getal: String(totaalOpdrachten), label: "opdrachten online", icon: "doc" as const },
    { getal: String(sectorTegels.length), label: "sectoren", icon: "grid" as const },
    { getal: String(aantalProfessionals), label: "professionals met profiel", icon: "star" as const },
    { getal: "€ 0", label: "kosten voor zzp’ers", icon: "euro" as const },
  ];

  return (
    <>
      {/* ───────────── Hero met foto-achtergrond + zoekbalk ───────────── */}
      <section className="relative isolate overflow-hidden">
        <Image
          src={HERO_FOTO}
          alt="Een zzp’er en een opdrachtgever overleggen samen op locatie"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
        <div
          aria-hidden
          className="from-forest-900/95 via-forest-900/80 to-forest-800/45 absolute inset-0 -z-10 bg-gradient-to-r"
        />

        <Container className="grid items-center gap-12 py-16 text-white md:py-24 lg:grid-cols-2">
          <div className="max-w-xl">
            <span className="bs-load inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
              <span className="bg-brand-400 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-brand-500)" }} />
              Hét zzp-platform voor heel Nederland
            </span>
            <h1
              className="bs-load mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl"
              style={{ animationDelay: "60ms" }}
            >
              Jouw volgende opdracht
              <br />
              begint hier.
            </h1>
            <p
              className="bs-load mt-5 max-w-lg text-lg leading-relaxed text-white/85"
              style={{ animationDelay: "120ms" }}
            >
              Blader door actuele opdrachten in elke sector, vergelijk tarieven
              en reageer rechtstreeks bij de opdrachtgever — zonder account en
              zonder tussenpersoon.
            </p>

            {/* Zoekbalk */}
            <form
              method="get"
              action="/opdrachten"
              className="bs-load shadow-elevated mt-8 flex flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row"
              style={{ animationDelay: "160ms" }}
            >
              <label className="flex flex-1 items-center gap-2 px-3">
                <svg aria-hidden viewBox="0 0 24 24" fill="none" className="text-foreground-muted h-5 w-5 shrink-0">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  name="q"
                  placeholder="Timmerman, elektricien…"
                  className="text-foreground placeholder:text-foreground-muted h-11 w-full bg-transparent text-sm outline-none"
                />
              </label>
              <label className="border-border flex flex-1 items-center gap-2 px-3 sm:border-l">
                <Icon name="pin" className="text-foreground-muted h-5 w-5 shrink-0" />
                <input
                  name="plaats"
                  placeholder="Plaats"
                  className="text-foreground placeholder:text-foreground-muted h-11 w-full bg-transparent text-sm outline-none"
                />
              </label>
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 h-12 shrink-0 rounded-xl px-6 text-sm font-semibold text-white transition-colors"
              >
                Zoek opdrachten
              </button>
            </form>

            {/* Vertrouwens-chips */}
            <div
              className="bs-load mt-5 flex flex-col gap-2 text-sm text-white/85 sm:flex-row sm:flex-wrap sm:gap-x-6"
              style={{ animationDelay: "240ms" }}
            >
              {[
                "Bekijken zonder account",
                "KvK en certificaten gecontroleerd",
                "Direct contact met de opdrachtgever",
              ].map((c) => (
                <span key={c} className="inline-flex items-center gap-2">
                  <span aria-hidden className="text-brand-100 font-bold">
                    ✓
                  </span>
                  {c}
                </span>
              ))}
            </div>

            <p
              className="bs-load mt-6 text-sm text-white/70"
              style={{ animationDelay: "300ms" }}
            >
              Professional nodig?{" "}
              <Link
                href="/bedrijven/opdracht-plaatsen"
                className="font-semibold text-white underline underline-offset-4 hover:text-white/90"
              >
                Plaats gratis een opdracht
              </Link>
            </p>
          </div>

          {/* Uitgelichte opdracht-kaart (echte data) */}
          {featured ? (
            <div className="hidden lg:justify-self-end lg:block">
              <div
                className="bs-load bg-surface shadow-elevated w-[22rem] max-w-full rounded-3xl p-6"
                style={{ animationDelay: "220ms" }}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-brand-50 text-brand-700 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
                    {featured.skill.naam}
                  </span>
                  <span className="text-foreground-muted text-xs font-semibold tracking-wide uppercase">
                    Uitgelicht
                  </span>
                </div>
                <p className="text-foreground mt-4 text-2xl font-bold leading-snug">
                  {featured.titel}
                </p>
                <p className="text-foreground-muted mt-1 text-sm">
                  {featured.company.naam}
                </p>
                <div className="text-foreground-muted mt-4 space-y-2 text-sm">
                  <p className="inline-flex items-center gap-2">
                    <Icon name="pin" className="text-brand-600 h-4 w-4" />
                    {featured.locatiePlaats}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Icon name="calendar" className="text-brand-600 h-4 w-4" />
                    Start {datumKort(featured.startdatum)}
                  </p>
                </div>
                <div className="border-border mt-5 flex items-center justify-between border-t pt-5">
                  <span className="bg-accent-500 text-ink rounded-full px-3 py-1 text-sm font-bold">
                    {tariefLabel(featured.gewenstUurtariefCents)}
                  </span>
                  <Link
                    href={`/opdrachten/${featured.slug}`}
                    className="text-brand-700 inline-flex items-center gap-1 text-sm font-semibold hover:gap-2"
                  >
                    Bekijk opdracht →
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      {/* ───────────── Cijferbalk (echte cijfers uit de database) ───────────── */}
      <section className="bg-surface -mt-8 md:-mt-12">
        <Container>
          <div className="border-border bg-surface shadow-soft grid grid-cols-2 gap-4 rounded-3xl border p-5 md:grid-cols-4 md:p-6">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="bg-brand-50 text-brand-600 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <Icon name={s.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-brand-700 text-2xl font-extrabold leading-none tracking-tight">
                    {s.getal}
                  </p>
                  <p className="text-foreground-muted mt-1 text-sm">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────────── Actuele opdrachten ───────────── */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
                Nieuwste opdrachten
              </h2>
              <p className="text-foreground-muted mt-2">
                Vers online, uit heel Nederland. Bekijken en vergelijken kan
                zonder account.
              </p>
            </div>
            <Link
              href="/opdrachten"
              className="text-brand-700 shrink-0 font-semibold hover:underline"
            >
              Bekijk alle {totaalOpdrachten} opdrachten →
            </Link>
          </div>

          {recente.length === 0 ? (
            <div className="border-border text-foreground-muted mt-8 rounded-2xl border border-dashed p-10 text-center">
              Er staan op dit moment nog geen openbare opdrachten online.{" "}
              <Link href="/bedrijven/opdracht-plaatsen" className="text-brand-700 font-semibold">
                Plaats de eerste opdracht →
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {recente.map((job) => (
                <OpdrachtKaart key={job.id} job={job} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ───────────── Opdrachten per sector ───────────── */}
      {sectorTegels.length > 0 ? (
        <section className="bg-surface-muted py-16 md:py-20">
          <Container>
            <h2 className="text-2xl font-bold tracking-tight md:text-4xl">
              Werk in elke sector
            </h2>
            <p className="text-foreground-muted mt-2">
              Van bouw en techniek tot zorg, horeca, transport en ICT — kies je
              vakgebied.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {sectorTegels.map((t) => (
                <SectorTegel key={t.sector} sector={t.sector} aantal={t.aantal} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* ───────────── Voor zzp'ers (tekst + beeld) ───────────── */}
      <section className="py-16 md:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-brand-700 text-sm font-bold tracking-wide uppercase">
              Voor zzp’ers
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
              Jij kiest, jij beslist.
            </h2>
            <p className="text-foreground-muted mt-4 text-lg">
              Geen tussenpersoon die opdrachten voor je uitzoekt. Je ziet alles —
              inclusief het tarief — en bepaalt zelf waar je op reageert.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Zoeken en filteren zonder account",
                "Uurtarief of tariefrange staat bij elke opdracht",
                "Je reactie gaat rechtstreeks naar de opdrachtgever",
                "Eén profiel met je vakgebied, certificaten en beoordelingen",
              ].map((v) => (
                <li key={v} className="flex gap-3">
                  <span className="bg-brand-50 text-brand-600 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-foreground">{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/opdrachten" variant="brand" size="lg" className="rounded-xl">
                Bekijk opdrachten
              </ButtonLink>
              <ButtonLink href="/zzpers" variant="outline" size="lg" className="rounded-xl">
                Meer voor zzp’ers
              </ButtonLink>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] shadow-soft lg:order-last">
            <Image
              src={HERO_FOTO}
              alt="Vakmensen aan het werk"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-[62%_center]"
            />
          </div>
        </Container>
      </section>

      {/* ───────────── Voor opdrachtgevers (beeld + tekst) ───────────── */}
      <section className="bg-surface-muted py-16 md:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          {/* Branded paneel met een paar echte opdrachten */}
          <div className="from-forest-800 to-forest-900 relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br p-6 text-white shadow-elevated">
            <div aria-hidden className="bs-hero-mesh pointer-events-none absolute inset-0" />
            <p className="relative text-sm font-semibold text-white/80">
              Zo ziet een opdracht eruit
            </p>
            <div className="relative mt-4 space-y-3">
              {(recente.length ? recente : jobs).slice(0, 3).map((job) => {
                const meta = SECTOR_META[sectorVan(job.skill.slug)];
                return (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${meta.kleur}33`, color: "#fff" }}
                    >
                      <Icon name={meta.icon} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{job.titel}</p>
                      <p className="truncate text-xs text-white/70">
                        {job.locatiePlaats}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold">
                      {tariefLabel(job.gewenstUurtariefCents)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <span className="text-brand-700 text-sm font-bold tracking-wide uppercase">
              Voor opdrachtgevers
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-4xl">
              Binnen enkele minuten online.
            </h2>
            <p className="text-foreground-muted mt-4 text-lg">
              Beschrijf je klus in een paar korte stappen. Zelfstandigen reageren
              met hun tarief en beschikbaarheid, en je ziet meteen waarom iemand
              past.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Gratis plaatsen, geen abonnement",
                "Reacties met matchuitleg in plaats van een score zonder context",
                "Rechtstreeks contact, wij zitten er niet tussen",
              ].map((v) => (
                <li key={v} className="flex gap-3">
                  <span className="bg-brand-50 text-brand-600 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    ✓
                  </span>
                  <span className="text-foreground">{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/bedrijven/opdracht-plaatsen"
                variant="brand"
                size="lg"
                className="rounded-xl"
              >
                Plaats een opdracht
              </ButtonLink>
              <ButtonLink href="/vind-zzper" variant="outline" size="lg" className="rounded-xl">
                Vind een zzp’er
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* ───────────── Oproep tot actie ───────────── */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="from-brand-600 to-forest-900 relative overflow-hidden rounded-[var(--radius-card)] bg-gradient-to-br px-8 py-12 text-center text-white md:px-14 md:py-16">
            <div aria-hidden className="bs-hero-mesh pointer-events-none absolute inset-0" />
            <h2 className="relative text-2xl font-bold tracking-tight md:text-3xl">
              Klaar om te starten?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/85">
              Bekijk opdrachten of plaats er zelf een. Gratis, in een paar
              minuten — zonder tussenpersoon.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink
                href="/opdrachten"
                variant="primary"
                size="lg"
                className="rounded-xl bg-white text-brand-700 hover:bg-white/90"
              >
                Bekijk opdrachten
              </ButtonLink>
              <ButtonLink
                href="/bedrijven/opdracht-plaatsen"
                variant="outline"
                size="lg"
                className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Plaats een opdracht
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
