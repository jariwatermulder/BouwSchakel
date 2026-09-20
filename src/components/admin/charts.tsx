"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBucketLabel, type Bucket } from "@/server/analytics/periode";

/** Huisstijlkleuren voor grafieken (kobaltblauw, navy, lichtblauw, antraciet). */
export const KLEUREN = ["#2563eb", "#2f5da6", "#7ea1d8", "#18212b", "#adc4e8", "#1e40af", "#526174"];

export interface Serie {
  key: string;
  label: string;
  kleur?: string;
}

const tooltipStijl = {
  contentStyle: {
    borderRadius: 10,
    border: "1px solid #d6dee8",
    boxShadow: "0 8px 24px -12px rgba(11,18,32,0.2)",
    fontSize: 12,
  },
  labelStyle: { color: "#526174", fontWeight: 600 },
} as const;

/** Lijn/vlakgrafiek over tijd met één of meer series. */
export function TijdGrafiek({
  data,
  series,
  bucket,
  hoogte = 260,
  type = "area",
}: {
  data: ReadonlyArray<Record<string, string | number> | { label: string; waarde: number }>;
  series: Serie[];
  bucket: Bucket;
  hoogte?: number;
  type?: "area" | "bar";
}) {
  const fmt = (l: string) => formatBucketLabel(l, bucket);
  const gemeenschappelijk = (
    <>
      <CartesianGrid stroke="#e7ecf3" vertical={false} />
      <XAxis dataKey="label" tickFormatter={fmt} tick={{ fontSize: 11, fill: "#526174" }} tickLine={false} axisLine={false} minTickGap={24} />
      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#526174" }} tickLine={false} axisLine={false} width={36} />
      <Tooltip {...tooltipStijl} labelFormatter={(l) => fmt(String(l))} />
    </>
  );
  return (
    <div style={{ height: hoogte }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "bar" ? (
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            {gemeenschappelijk}
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.kleur ?? KLEUREN[i % KLEUREN.length]} radius={[4, 4, 0, 0]} maxBarSize={36} />
            ))}
          </BarChart>
        ) : (
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {series.map((s, i) => {
                const k = s.kleur ?? KLEUREN[i % KLEUREN.length];
                return (
                  <linearGradient key={s.key} id={`vlak-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={k} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={k} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            {gemeenschappelijk}
            {series.map((s, i) => {
              const k = s.kleur ?? KLEUREN[i % KLEUREN.length];
              return (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={k}
                  strokeWidth={2}
                  fill={`url(#vlak-${s.key})`}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              );
            })}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/** Mini-lijn in een KPI-kaart, zonder assen. */
export function Sparkline({ data, kleur = "#2563eb" }: { data: { label: string; waarde: number }[]; kleur?: string }) {
  if (data.length < 2) return null;
  return (
    <div className="h-10 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <Line type="monotone" dataKey="waarde" stroke={kleur} strokeWidth={1.75} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Donut voor verdelingen (apparaat, browser, OS). */
export function DonutGrafiek({ data, hoogte = 200 }: { data: { naam: string; aantal: number }[]; hoogte?: number }) {
  const totaal = data.reduce((s, d) => s + d.aantal, 0);
  if (!totaal) return <p className="text-foreground-muted text-sm">Nog geen data</p>;
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <div style={{ height: hoogte, width: hoogte }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="aantal" nameKey="naam" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none" isAnimationActive={false}>
              {data.map((_, i) => (
                <Cell key={i} fill={KLEUREN[i % KLEUREN.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStijl} formatter={(v) => [`${v} (${Math.round((Number(v) / totaal) * 100)}%)`, ""]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.naam} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 truncate">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: KLEUREN[i % KLEUREN.length] }} />
              <span className="truncate">{d.naam}</span>
            </span>
            <span className="text-foreground-muted tabular-nums">
              {d.aantal} · {Math.round((d.aantal / totaal) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
