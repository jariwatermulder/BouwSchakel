import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";
import { Avatar } from "@/components/avatar";
import { sectorMetaVan } from "@/lib/sector-meta";
import { groepeerSkills } from "@/lib/sectoren";
import { formatEuro } from "@/lib/utils";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { bedrijfOnboardingPad } from "@/server/company/service";
import { AccountNodig } from "@/components/account-nodig";
import { trackEvent } from "@/lib/analytics/track";
import {
  displayNaam,
  listPublicZzpers,
  listVakgebiedenVoorFilter,
} from "@/server/zzpers/directory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vind een zzp'er",
  description:
    "Zoek op vakgebied en regio, bekijk profielen van vakmensen en neem rechtstreeks contact op. Geen opdracht nodig.",
  alternates: { canonical: "/vind-zzper" },
};

const veld =
  "border-border bg-surface focus-visible:border-navy-500 h-11 rounded-lg border px-3 text-sm outline-none";

// Populaire bouw-vakgebieden (eerste focus). Slugs bestaan in de catalogus.
const POPULAIRE_VAKGEBIEDEN = [
  { naam: "Timmerman", slug: "timmerman" },
  { naam: "Elektricien", slug: "elektricien" },
  { naam: "Loodgieter", slug: "loodgieter" },
  { naam: "Schilder", slug: "schilder" },
  { naam: "Tegelzetter", slug: "tegelzetter" },
  { naam: "Metselaar", slug: "metselaar" },
  { naam: "Stukadoor", slug: "stukadoor" },
  { naam: "Dakdekker", slug: "dakdekker" },
  { naam: "Installateur", slug: "installateur" },
  { naam: "Stratenmaker", slug: "stratenmaker" },
];

const stappen = [
  {
    titel: "Zoek op vak en regio",
    tekst: "Kies je vak en regio. Maak gratis een account om passende profielen te bekijken en contact op te nemen.",
    src: "/images/stap-1-zoeken.png",
    alt: "Telefoon met de ZZP Schakel-zoekfunctie: vakgebied en plaats invullen.",
  },
  {
    titel: "Bekijk profielen",
    tekst: "Zie wie er werkt in jouw buurt, met vakgebied en werkgebied.",
    src: "/images/stap-2-profiel.png",
    alt: "Profielkaart van een vakman met vakgebied, werkgebied en ervaring.",
  },
  {
    titel: "Neem rechtstreeks contact op",
    tekst: "Bespreek zelf het werk, het tarief en de planning. Geen tussenlaag.",
    src: "/images/stap-3-contact.png",
    alt: "Rechtstreeks contact opnemen met een vakman via een bericht in het platform.",
  },
];

export default async function VindZzperPage({
  searchParams,
}: {
  searchParams: Promise<{ vak?: string; plaats?: string }>;
}) {
  const { vak, plaats } = await searchParams;
  // Passende profielen zijn alleen met een account zichtbaar. Zonder account
  // halen we ze ook niet op; de filters blijven wel bruikbaar en gaan mee in
  // `next`, zodat de bezoeker na registreren/inloggen hier terugkomt.
  const [user, vakgebieden] = await Promise.all([
    getCurrentUser(),
    listVakgebiedenVoorFilter(),
  ]);

  const heeftFilter = Boolean(vak || plaats);
  const query = new URLSearchParams();
  if (vak) query.set("vak", vak);
  if (plaats) query.set("plaats", plaats);
  const qs = query.toString();
  const huidigPad = qs ? `/vind-zzper?${qs}` : "/vind-zzper";

  // Opdrachtgevers vullen eerst bedrijfsnaam en KvK-nummer in.
  if (user?.role === "COMPANY") {
    const onboarding = await bedrijfOnboardingPad(user.id, huidigPad);
    if (onboarding) redirect(onboarding);
  }

  const zzpers = user ? await listPublicZzpers({ vakSlug: vak, plaats }) : [];

  // Zoekgedrag meten: wat wordt gezocht en of het iets oplevert. Voor
  // bezoekers zonder account zijn de resultaten onbekend (niet getoond).
  if (heeftFilter) {
    await trackEvent("search_performed", {
      userId: user?.id ?? null,
      userRole: user?.role ?? null,
      page: "/vind-zzper",
      metadata: {
        vak: vak ?? null,
        plaats: plaats?.trim().toLowerCase().slice(0, 60) ?? null,
        resultaten: user ? zzpers.length : null,
        gast: !user,
      },
    });
  }

  return (
    <>
      <Container className="py-8 md:py-10">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Vind een zzp’er
        </h1>
        <p className="text-foreground-muted mt-1">
          Zoek op vakgebied en regio. Om passende profielen te bekijken en
          rechtstreeks contact op te nemen maak je gratis een account aan als
          opdrachtgever.
        </p>
        <div className="text-foreground-muted mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-brand-600" aria-hidden>✓</span>
            Gratis account als opdrachtgever
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-brand-600" aria-hidden>✓</span>
            Rechtstreeks contact, geen tussenlaag
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-brand-600" aria-hidden>✓</span>
            Gratis tijdens de introductie
          </span>
        </div>

        {/* Filters */}
        <form
          method="get"
          className="border-border bg-surface mt-5 flex flex-wrap items-end gap-3 rounded-2xl border p-4"
        >
          <div className="flex-1">
            <label htmlFor="vak" className="text-foreground mb-1 block text-sm font-medium">
              Vakgebied
            </label>
            <select id="vak" name="vak" defaultValue={vak ?? ""} className={`${veld} w-full`}>
              <option value="">Alle vakgebieden</option>
              {/* Gegroepeerd per sector; bouw en techniek (onze startfocus) staan bovenaan. */}
              {groepeerSkills(vakgebieden).map(({ sector, skills }) => (
                <optgroup key={sector} label={sector}>
                  {skills.map((v) => (
                    <option key={v.slug} value={v.slug}>
                      {v.naam}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="plaats" className="text-foreground mb-1 block text-sm font-medium">
              Plaats of regio
            </label>
            <input
              id="plaats"
              name="plaats"
              defaultValue={plaats ?? ""}
              autoComplete="address-level2"
              placeholder="Bijv. Groningen…"
              className={`${veld} w-full`}
            />
          </div>
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 h-11 rounded-lg px-5 text-sm font-semibold text-white"
          >
            Zoek vakmensen
          </button>
          {heeftFilter ? (
            <Link
              href="/vind-zzper"
              className="text-foreground-muted hover:text-foreground h-11 rounded-lg px-3 text-sm font-medium leading-[2.75rem]"
            >
              Wis filters
            </Link>
          ) : null}
        </form>

        {/* Populaire vakgebieden (snelfilters) */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-foreground-muted text-sm">Populair:</span>
          {POPULAIRE_VAKGEBIEDEN.map((v) => (
            <Link
              key={v.slug}
              href={`/vind-zzper?vak=${v.slug}`}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                vak === v.slug
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-border bg-surface text-foreground hover:border-brand-500 hover:text-brand-700"
              }`}
            >
              {v.naam}
            </Link>
          ))}
        </div>

        {!user ? (
          <div className="mt-6">
            <AccountNodig next={huidigPad} />
          </div>
        ) : zzpers.length === 0 ? (
          <div className="border-border mt-6 rounded-2xl border border-dashed p-10 text-center">
            <p className="text-foreground font-medium">
              Nog geen passende profielen voor deze zoekopdracht.
            </p>
            <p className="text-foreground-muted mx-auto mt-2 max-w-md text-sm">
              Probeer een ruimere regio of een ander vakgebied. Er zijn nog niet
              in elke plaats vakmensen zichtbaar.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/vind-zzper" variant="brand" className="rounded-xl">
                Bekijk alle vakgebieden
              </ButtonLink>
              {plaats ? (
                <ButtonLink
                  href={vak ? `/vind-zzper?vak=${vak}` : "/vind-zzper"}
                  variant="outline"
                  className="rounded-xl"
                >
                  Zoek in heel Nederland
                </ButtonLink>
              ) : null}
            </div>
          </div>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {zzpers.map((z) => {
              const naam = displayNaam(z);
              const geverifieerd = z.verificatieStatus === "GEVERIFIEERD";
              return (
                <li key={z.id}>
                  <Link
                    href={`/vind-zzper/${z.id}`}
                    data-track="search_result_clicked"
                    data-track-label={z.id}
                    className="group border-border bg-surface shadow-soft hover:border-navy-300 flex h-full flex-col rounded-[var(--radius-card)] border p-5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar fotoKey={z.fotoKey} naam={naam} size={44} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{naam}</p>
                        <p className="text-foreground-muted truncate text-xs">
                          {z.werkgebiedPlaats || "Heel Nederland"}
                          {z.jarenErvaring ? ` · ${z.jarenErvaring} jr ervaring` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {geverifieerd ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <Icon name="shield" className="h-3 w-3" /> Geverifieerd
                        </span>
                      ) : null}
                      {z.vakgebiedAnders ? (
                        <span className="bg-brand-50 text-brand-700 rounded-full px-2 py-0.5 text-xs font-semibold">
                          {z.vakgebiedAnders}
                        </span>
                      ) : null}
                      {z.skills.slice(0, z.vakgebiedAnders ? 2 : 3).map((s) => {
                        const meta = sectorMetaVan(s.skill.slug);
                        return (
                          <span
                            key={s.skillId}
                            className="rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: `${meta.kleur}1a`, color: meta.kleur }}
                          >
                            {s.skill.naam}
                          </span>
                        );
                      })}
                    </div>

                    {z.over ? (
                      <p className="text-foreground-muted mt-3 line-clamp-3 text-sm">
                        {z.over}
                      </p>
                    ) : null}

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="text-sm font-semibold">
                        {z.uurtariefCents
                          ? `${formatEuro(z.uurtariefCents)} / u`
                          : "Tarief op aanvraag"}
                      </span>
                      <span className="text-accent-600 text-sm font-semibold">
                        Bekijk profiel →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>

      {/* ───────────── Zo werkt het ───────────── */}
      <section className="bg-surface-muted mt-4 py-12 md:py-16">
        <Container>
          <h2 className="text-2xl font-bold md:text-3xl">Zo werkt het</h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {stappen.map((stap, i) => (
              <li key={stap.titel} className="flex flex-col items-center text-center">
                <Image
                  src={stap.src}
                  alt={stap.alt}
                  width={820}
                  height={820}
                  sizes="(min-width: 640px) 320px, 80vw"
                  className="h-44 w-44 object-contain md:h-52 md:w-52"
                />
                <p className="text-brand-700 mt-5 text-sm font-semibold">
                  Stap {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{stap.titel}</h3>
                <p className="text-foreground-muted mx-auto mt-2 max-w-xs text-sm leading-relaxed">
                  {stap.tekst}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
