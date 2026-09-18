import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";
import { sectorMetaVan } from "@/lib/sector-meta";
import { formatEuro } from "@/lib/utils";
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
    tekst: "Kies een vakgebied en je plaats. Zoeken kan zonder account.",
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
    alt: "Contact opnemen met een vakman via bericht, bellen of WhatsApp.",
  },
];

export default async function VindZzperPage({
  searchParams,
}: {
  searchParams: Promise<{ vak?: string; plaats?: string }>;
}) {
  const { vak, plaats } = await searchParams;
  const [zzpers, vakgebieden] = await Promise.all([
    listPublicZzpers({ vakSlug: vak, plaats }),
    listVakgebiedenVoorFilter(),
  ]);

  const heeftFilter = Boolean(vak || plaats);

  return (
    <>
      <Container className="py-8 md:py-10">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Vind een zzp’er
        </h1>
        <p className="text-foreground-muted mt-1">
          Bekijk vakmensen en neem rechtstreeks contact op. Zoeken kan zonder
          account; om contact op te nemen maak je een gratis account aan.
        </p>
        <div className="text-foreground-muted mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-brand-600" aria-hidden>✓</span>
            Zoeken zonder account
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-brand-600" aria-hidden>✓</span>
            Account nodig om contact op te nemen
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
              {vakgebieden.map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.naam}
                </option>
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

        {zzpers.length === 0 ? (
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
                    className="group border-border bg-surface shadow-soft hover:border-navy-300 flex h-full flex-col rounded-[var(--radius-card)] border p-5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-ink flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                        {naam.slice(0, 2).toUpperCase()}
                      </span>
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
                      {z.skills.slice(0, 3).map((s) => {
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
