import type { Metadata } from "next";
import Link from "next/link";
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
    "Blader door beschikbare, gecontroleerde zzp'ers in elke sector en neem direct contact op — geen opdracht nodig.",
  alternates: { canonical: "/vind-zzper" },
};

const veld =
  "border-border bg-surface focus-visible:border-navy-500 h-11 rounded-lg border px-3 text-sm outline-none";

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
          account.
        </p>

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
                      <span className="bg-navy-800 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
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
    </>
  );
}
