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
  const naam = displayNaam(data);
  return {
    title: `${naam} — zzp'er`,
    description: data.over?.slice(0, 155) ?? `Bekijk het profiel van ${naam} op ZZP Schakel.`,
    robots: { index: false },
  };
}

export default async function ZzperProfielPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicZzper(id);
  if (!data) notFound();

  const p = data;
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
            <span className="bg-ink flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white">
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

        </div>

        {/* Contact-zijbalk */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <p className="text-sm font-semibold">
              {p.uurtariefCents ? `${formatEuro(p.uurtariefCents)} / uur` : "Tarief op aanvraag"}
            </p>
            <p className="text-foreground-muted mt-1 text-xs">
              Neem contact op — geen opdracht nodig, wel een account.
            </p>
            <form action={neemContactOpAction} className="mt-4">
              <input type="hidden" name="zzpProfileId" value={p.id} />
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-colors"
              >
                Neem contact op
              </button>
            </form>
            <p className="text-foreground-muted mt-3 text-center text-xs">
              Je stuurt een bericht via ZZP Schakel; de zzp’er antwoordt je
              rechtstreeks. Afspraken maken jullie samen.
            </p>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
