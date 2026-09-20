import type { Metadata } from "next";
import Link from "next/link";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { parsePeriode } from "@/server/analytics/periode";
import { activiteit, funnel, kpiOverzicht } from "@/server/analytics/queries";
import { TijdGrafiek } from "@/components/admin/charts";
import { LiveFeed } from "@/components/admin/live-feed";
import { Funnel, KpiKaart, PaginaKop, Paneel } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

type SP = Promise<{ p?: string; van?: string; tot?: string }>;

export default async function AdminDashboardPage({ searchParams }: { searchParams: SP }) {
  await requireCurrentAdmin("SUPPORT");
  const periode = parsePeriode(await searchParams);
  const [overzicht, fun, feed] = await Promise.all([kpiOverzicht(periode), funnel(periode), activiteit(undefined, 12)]);
  const kpi = (id: string) => overzicht.kpis.find((k) => k.id === id)!;

  const hoofd = ["uniek-maand", "zzp-totaal", "bedrijf-totaal", "contact"];
  const rest = overzicht.kpis.filter((k) => !hoofd.includes(k.id));
  const bezoekers = kpi("uniek-maand").reeks ?? [];
  const zzp = kpi("zzp-periode").reeks ?? [];
  const bedrijf = kpi("bedrijf-periode").reeks ?? [];
  const grafiek = bezoekers.map((b, i) => ({
    label: b.label,
    bezoekers: b.waarde,
    zzpers: zzp[i]?.waarde ?? 0,
    bedrijven: bedrijf[i]?.waarde ?? 0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
      <PaginaKop
        titel="Dashboard"
        intro={`Belangrijkste cijfers van ZZP Schakel voor: ${periode.label}. Gesprekken (contactaanvragen) zijn ons kerngetal: contact dat via het platform tot stand komt.`}
        periode={periode}
        bijgewerkt={new Date().toISOString()}
      />

      {/* Hoofd-KPI's */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hoofd.map((id) => (
          <KpiKaart key={id} kpi={kpi(id)} groot />
        ))}
      </div>

      {/* Verloop */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Paneel titel="Bezoekers en registraties" sub={`Per ${periode.bucket === "hour" ? "uur" : periode.bucket === "day" ? "dag" : periode.bucket === "week" ? "week" : "maand"} · ${periode.label}`} className="lg:col-span-2">
          {grafiek.some((g) => g.bezoekers || g.zzpers || g.bedrijven) ? (
            <TijdGrafiek
              data={grafiek}
              bucket={periode.bucket}
              series={[
                { key: "bezoekers", label: "Unieke bezoekers" },
                { key: "zzpers", label: "Nieuwe zzp'ers", kleur: "#18212b" },
                { key: "bedrijven", label: "Nieuwe bedrijven", kleur: "#7ea1d8" },
              ]}
            />
          ) : (
            <p className="text-foreground-muted py-10 text-center text-sm">Nog geen data in deze periode.</p>
          )}
        </Paneel>
        <Paneel titel="Live activiteit" actie={<Link href="/admin/analytics/activiteit" className="text-brand-600 text-xs font-semibold hover:underline">Alles</Link>}>
          <LiveFeed initieel={feed} compact />
        </Paneel>
      </div>

      {/* Overige KPI's */}
      <h2 className="mt-8 text-lg font-semibold">Alle kerncijfers</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rest.map((k) => (
          <KpiKaart key={k.id} kpi={k} />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Paneel titel="Funnel" sub="Van bezoeker tot contact in de gekozen periode" className="lg:col-span-2">
          <Funnel stappen={fun.stappen} />
        </Paneel>
        <Paneel titel="Aandacht nodig">
          <ul className="divide-y divide-[var(--color-border)]">
            {overzicht.aandacht.map((a) => (
              <li key={a.label}>
                <Link href={a.href} className="hover:bg-surface-muted -mx-2 flex items-center justify-between rounded-md px-2 py-2.5 text-sm">
                  <span>{a.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${a.waarde > 0 ? "bg-amber-100 text-amber-800" : "bg-surface-muted text-foreground-muted"}`}>
                    {a.waarde}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Paneel>
      </div>
    </div>
  );
}
