import Link from "next/link";
import { Sparkline } from "@/components/admin/charts";
import { PeriodeFilter } from "@/components/admin/periode-filter";
import { LiveStatus } from "@/components/admin/live-status";
import type { Kpi, FunnelStap, KwaliteitRij, VerdelingRij } from "@/server/analytics/queries";
import type { Periode } from "@/server/analytics/periode";
import { Suspense } from "react";

/** Vaste bouwstenen van de admin-pagina's (server components). */

export function PaginaKop({
  titel,
  intro,
  periode,
  bijgewerkt,
  statusLabel,
}: {
  titel: string;
  intro?: string;
  periode?: Periode;
  bijgewerkt: string;
  statusLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{titel}</h1>
        {intro ? <p className="text-foreground-muted mt-1 max-w-2xl text-sm">{intro}</p> : null}
        <div className="mt-2">
          <LiveStatus bijgewerkt={bijgewerkt} label={statusLabel} />
        </div>
      </div>
      {periode ? (
        <Suspense fallback={null}>
          <PeriodeFilter actief={periode.key} />
        </Suspense>
      ) : null}
    </div>
  );
}

export function Paneel({
  titel,
  sub,
  children,
  className = "",
  actie,
}: {
  titel?: string;
  sub?: string;
  children: React.ReactNode;
  className?: string;
  actie?: React.ReactNode;
}) {
  return (
    <section className={`border-border bg-surface rounded-xl border p-5 ${className}`}>
      {titel ? (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{titel}</h2>
            {sub ? <p className="text-foreground-muted mt-0.5 text-xs">{sub}</p> : null}
          </div>
          {actie}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function formatGetal(v: number | null | undefined, procent = false): string {
  if (v == null) return "Nog geen data";
  return procent ? `${v.toLocaleString("nl-NL")}%` : v.toLocaleString("nl-NL");
}

export function formatDuur(sec: number | null): string {
  if (sec == null) return "Nog geen data";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function KpiKaart({ kpi, groot = false }: { kpi: Kpi; groot?: boolean }) {
  const geenData = kpi.waarde == null;
  return (
    <div className="border-border bg-surface flex flex-col rounded-xl border p-4">
      <p className="text-foreground-muted text-xs font-medium">{kpi.label}</p>
      <p className={`mt-1 font-bold tabular-nums tracking-tight ${groot ? "text-3xl" : "text-2xl"} ${geenData ? "text-foreground-muted text-base font-medium" : ""}`}>
        {formatGetal(kpi.waarde, kpi.procent)}
      </p>
      {!geenData && kpi.verschil != null ? (
        <p className="mt-1 text-xs">
          <span className={`font-semibold ${kpi.verschil > 0 ? "text-emerald-700" : kpi.verschil < 0 ? "text-red-600" : "text-foreground-muted"}`}>
            {kpi.verschil > 0 ? "+" : ""}
            {kpi.verschil}%
          </span>{" "}
          <span className="text-foreground-muted">{kpi.vergelijking}</span>
        </p>
      ) : !geenData && kpi.vergelijking && kpi.verschil === null ? (
        <p className="text-foreground-muted mt-1 text-xs">Geen vergelijking (vorige periode 0)</p>
      ) : null}
      {kpi.reeks && !geenData ? (
        <div className="mt-2">
          <Sparkline data={kpi.reeks} />
        </div>
      ) : null}
      {kpi.toelichting ? <p className="text-foreground-muted mt-auto pt-2 text-[11px]">{kpi.toelichting}</p> : null}
    </div>
  );
}

/** Eenvoudige KPI zonder vergelijking. */
export function Cijfer({ label, waarde, sub, procent }: { label: string; waarde: number | string | null; sub?: string; procent?: boolean }) {
  return (
    <div className="border-border bg-surface rounded-xl border p-4">
      <p className="text-foreground-muted text-xs font-medium">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums tracking-tight ${waarde == null ? "text-foreground-muted text-base font-medium" : ""}`}>
        {typeof waarde === "string" ? waarde : formatGetal(waarde, procent)}
      </p>
      {sub ? <p className="text-foreground-muted mt-1 text-[11px]">{sub}</p> : null}
    </div>
  );
}

/** Horizontale staafjes voor een top-N-verdeling. */
export function Verdeling({ data, leeg = "Nog geen data" }: { data: VerdelingRij[]; leeg?: string }) {
  const max = Math.max(0, ...data.map((d) => d.aantal));
  if (data.length === 0 || max === 0) return <p className="text-foreground-muted text-sm">{leeg}</p>;
  return (
    <ul className="space-y-2">
      {data.map((d) => (
        <li key={d.naam} className="text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate">{d.naam}</span>
            <span className="text-foreground-muted shrink-0 tabular-nums">{d.aantal.toLocaleString("nl-NL")}</span>
          </div>
          <div className="bg-surface-muted mt-1 h-1.5 w-full overflow-hidden rounded-full">
            <div className="bg-brand-500 h-full rounded-full" style={{ width: `${Math.max(2, (d.aantal / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Funnel({ stappen }: { stappen: FunnelStap[] }) {
  const eerste = stappen.find((s) => s.waarde != null && s.waarde > 0)?.waarde ?? 0;
  // Vorige gevulde stap per index vooraf bepalen (geen mutatie tijdens render).
  const vorigen: (number | null)[] = [];
  let laatste: number | null = null;
  for (const s of stappen) {
    vorigen.push(laatste);
    if (s.waarde != null) laatste = s.waarde;
  }
  return (
    <ol className="space-y-3">
      {stappen.map((s, i) => {
        const vorige = vorigen[i] ?? null;
        const breedte = s.waarde != null && eerste ? Math.max(3, (s.waarde / eerste) * 100) : 0;
        const afval = s.waarde != null && vorige != null && vorige > 0 ? Math.round((1 - s.waarde / vorige) * 100) : null;
        return (
          <li key={s.id} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium">{s.label}</span>
              <span className="text-foreground-muted shrink-0 tabular-nums">
                {s.waarde == null ? (s.toelichting?.startsWith("Niet van toepassing") ? "Niet van toepassing" : "Nog geen data") : s.waarde.toLocaleString("nl-NL")}
                {s.waarde != null && eerste ? ` · ${Math.round((s.waarde / eerste) * 100)}%` : ""}
              </span>
            </div>
            <div className="bg-surface-muted mt-1 h-3 w-full overflow-hidden rounded-md">
              {s.waarde != null ? <div className="bg-brand-500 h-full rounded-md" style={{ width: `${breedte}%` }} /> : null}
            </div>
            <p className="text-foreground-muted mt-0.5 text-[11px]">
              {[
                afval != null && afval > 0 ? `${afval}% haakt hier af` : afval === 0 && s.waarde != null ? "geen afval" : null,
                s.toelichting ?? null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function Kwaliteit({ rijen }: { rijen: KwaliteitRij[] }) {
  return (
    <ul className="space-y-2.5">
      {rijen.map((r) => {
        const p = r.aantal != null && r.totaal ? Math.round((r.aantal / r.totaal) * 100) : null;
        return (
          <li key={r.label} className="text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>{r.label}</span>
              <span className="text-foreground-muted shrink-0 tabular-nums">
                {r.aantal == null ? (r.toelichting ?? "Nog geen data") : `${r.aantal} / ${r.totaal} · ${p ?? 0}%`}
              </span>
            </div>
            <div className="bg-surface-muted mt-1 h-1.5 w-full overflow-hidden rounded-full">
              {p != null ? <div className="bg-navy-500 h-full rounded-full" style={{ width: `${p}%` }} /> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ExportKnoppen({ periode, datasets }: { periode: Periode; datasets: { key: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {datasets.map((d) => (
        <Link
          key={d.key}
          href={`/api/admin/export?dataset=${d.key}&${periode.query}`}
          prefetch={false}
          className="border-border bg-surface hover:border-brand-500 hover:text-brand-700 inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold"
        >
          <span aria-hidden>↓</span> {d.label} (CSV)
        </Link>
      ))}
    </div>
  );
}
