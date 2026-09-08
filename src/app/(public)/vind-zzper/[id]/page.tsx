import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/home/pictos";
import { sectorMetaVan } from "@/lib/sector-meta";
import { formatEuro } from "@/lib/utils";
import { displayNaam, getPublicZzper } from "@/server/zzpers/directory";
import { neemContactOpAction } from "../actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getPublicZzper(id);
  if (!data) return { title: "Profiel niet gevonden" };
  const naam = displayNaam(data.profile);
  return {
    title: `${naam} — zzp'er`,
    description: data.profile.over?.slice(0, 155) ?? `Bekijk het profiel van ${naam} op ZZP Connect.`,
    robots: { index: false },
  };
}

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

export default async function ZzperProfielPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicZzper(id);
  if (!data) notFound();

  const { profile: p, reviews, gemiddelde, aantalReviews } = data;
  const naam = displayNaam(p);
  const geverifieerd = p.verificatieStatus === "GEVERIFIEERD";

  return (
    <Container className="max-w-4xl py-8 md:py-12">
      <Link href="/vind-zzper" className="text-foreground-muted hover:text-foreground text-sm">
        ← Terug naar alle zzp’ers
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Hoofdkolom */}
        <div>
          <div className="flex items-center gap-4">
            <span className="bg-navy-800 flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
              {naam.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{naam}</h1>
              <p className="text-foreground-muted mt-0.5 text-sm">
                {p.werkgebiedPlaats || "Heel Nederland"}
                {p.jarenErvaring ? ` · ${p.jarenErvaring} jaar ervaring` : ""}
              </p>
            </div>
          </div>

          {/* Vertrouwenslabels */}
          <div className="mt-4 flex flex-wrap gap-2">
            {geverifieerd ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Icon name="shield" className="h-3.5 w-3.5" /> Geverifieerd
              </span>
            ) : null}
            {gemiddelde != null ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Icon name="star" className="h-3.5 w-3.5" />
                {gemiddelde.toFixed(1)} / 5 ({aantalReviews})
              </span>
            ) : null}
            {p.eigenBus ? (
              <span className="border-border bg-surface rounded-full border px-3 py-1 text-xs font-medium">
                Eigen vervoer
              </span>
            ) : null}
            {p.vca ? (
              <span className="border-border bg-surface rounded-full border px-3 py-1 text-xs font-medium">
                VCA
              </span>
            ) : null}
          </div>

          {p.over ? (
            <Card className="mt-6">
              <CardTitle>Over</CardTitle>
              <p className="text-foreground-muted mt-2 text-sm whitespace-pre-line">
                {p.over}
              </p>
            </Card>
          ) : null}

          {/* Vakgebieden */}
          {p.skills.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">Vakgebieden</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.skills.map((s) => {
                  const meta = sectorMetaVan(s.skill.slug);
                  return (
                    <span
                      key={s.skillId}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold"
                      style={{ backgroundColor: `${meta.kleur}1a`, color: meta.kleur }}
                    >
                      <Icon name={meta.icon} className="h-3.5 w-3.5" />
                      {s.skill.naam}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Certificaten */}
          {p.certifications.length > 0 ? (
            <div className="mt-6">
              <h2 className="text-sm font-semibold">Certificaten</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.certifications.map((c) => (
                  <span
                    key={c.id}
                    className="border-border bg-surface inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
                  >
                    <Icon name="shield" className="text-foreground-muted h-3.5 w-3.5" />
                    {c.certification.naam}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Reviews */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold">
              Beoordelingen {aantalReviews > 0 ? `(${aantalReviews})` : ""}
            </h2>
            {reviews.length === 0 ? (
              <p className="text-foreground-muted mt-2 text-sm">
                Nog geen beoordelingen. Reviews zijn alleen mogelijk na een echte
                opdracht via het platform.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {reviews.map((r) => {
                  const gem =
                    (r.scoreKwaliteit +
                      r.scoreCommunicatie +
                      r.scoreBetrouwbaarheid +
                      r.scoreAfspraken) /
                    4;
                  return (
                    <li key={r.id} className="border-border bg-surface rounded-xl border p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-amber-700">
                          {gem.toFixed(1)} / 5
                        </span>
                        <span className="text-foreground-muted text-xs">
                          {datum(r.gepubliceerdOp)}
                        </span>
                      </div>
                      {r.toelichting ? (
                        <p className="text-foreground-muted mt-1 text-sm">
                          {r.toelichting}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Contact-zijbalk */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <p className="text-sm font-semibold">
              {p.uurtariefCents ? `${formatEuro(p.uurtariefCents)} / uur` : "Tarief op aanvraag"}
            </p>
            <p className="text-foreground-muted mt-1 text-xs">
              Neem rechtstreeks contact op — geen opdracht nodig.
            </p>
            <form action={neemContactOpAction} className="mt-4">
              <input type="hidden" name="zzpProfileId" value={p.id} />
              <button
                type="submit"
                className="bg-accent-500 text-ink flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                Neem contact op
              </button>
            </form>
            <p className="text-foreground-muted mt-3 text-center text-xs">
              Je chat veilig via ZZP Connect.
            </p>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
