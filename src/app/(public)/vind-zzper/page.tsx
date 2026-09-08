import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
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

  return (
    <>
      <PageIntro
        eyebrow="Voor bedrijven"
        title="Vind een zzp'er"
        lead="Blader door beschikbare, gecontroleerde professionals en neem direct contact op — je hoeft geen opdracht te plaatsen."
      />

      <Container className="py-8 md:py-12">
        {/* Filters */}
        <form
          method="get"
          className="border-border bg-surface-muted/50 flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border p-4"
        >
          <div className="flex-1">
            <label htmlFor="vak" className="text-foreground-muted mb-1 block text-xs font-semibold">
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
            <label htmlFor="plaats" className="text-foreground-muted mb-1 block text-xs font-semibold">
              Plaats / regio
            </label>
            <input
              id="plaats"
              name="plaats"
              defaultValue={plaats ?? ""}
              placeholder="Bijv. Groningen"
              className={`${veld} w-full`}
            />
          </div>
          <button
            type="submit"
            className="bg-navy-800 hover:bg-navy-700 h-11 rounded-lg px-5 text-sm font-semibold text-white"
          >
            Filter
          </button>
        </form>

        <p className="text-foreground-muted mt-4 text-sm">
          {zzpers.length} {zzpers.length === 1 ? "professional" : "professionals"} gevonden
        </p>

        {zzpers.length === 0 ? (
          <div className="border-border text-foreground-muted mt-4 rounded-[var(--radius-card)] border border-dashed p-10 text-center">
            Geen zzp’ers gevonden met deze filters. Pas je zoekopdracht aan.
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
