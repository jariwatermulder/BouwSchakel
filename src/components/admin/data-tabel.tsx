"use client";

import { useMemo, useState } from "react";

export interface Kolom {
  key: string;
  label: string;
  /** Bepaalt uitlijning en opmaak; getallen sorteren numeriek. */
  type?: "tekst" | "getal" | "procent" | "duur";
}

export type Rij = Record<string, string | number | null>;

function formatDuur(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function toon(v: string | number | null, type: Kolom["type"]): string {
  if (v == null) return "-";
  if (typeof v === "number") {
    if (type === "procent") return `${v.toLocaleString("nl-NL")}%`;
    if (type === "duur") return formatDuur(v);
    return v.toLocaleString("nl-NL");
  }
  return v;
}

/**
 * Sorteerbare, filterbare tabel voor gedetailleerde data. Client-side, dus
 * geschikt voor lijsten tot een paar duizend rijen (de queries beperken dat al).
 */
export function DataTabel({
  rijen,
  kolommen,
  zoekbaar = true,
  sorteerOp,
  leeg = "Nog geen data",
  maxRijen = 200,
}: {
  rijen: Rij[];
  kolommen: Kolom[];
  zoekbaar?: boolean;
  sorteerOp?: string;
  leeg?: string;
  maxRijen?: number;
}) {
  const [zoek, setZoek] = useState("");
  const [sort, setSort] = useState<{ key: string; richting: "asc" | "desc" } | null>(
    sorteerOp ? { key: sorteerOp, richting: "desc" } : null,
  );

  const zichtbaar = useMemo(() => {
    let r = rijen;
    if (zoek.trim()) {
      const q = zoek.trim().toLowerCase();
      r = r.filter((rij) => Object.values(rij).some((v) => String(v ?? "").toLowerCase().includes(q)));
    }
    if (sort) {
      const { key, richting } = sort;
      r = [...r].sort((a, b) => {
        const x = a[key];
        const y = b[key];
        const cmp =
          typeof x === "number" && typeof y === "number"
            ? x - y
            : String(x ?? "").localeCompare(String(y ?? ""), "nl");
        return richting === "asc" ? cmp : -cmp;
      });
    }
    return r.slice(0, maxRijen);
  }, [rijen, zoek, sort, maxRijen]);

  function toggle(key: string) {
    setSort((s) =>
      s && s.key === key ? { key, richting: s.richting === "asc" ? "desc" : "asc" } : { key, richting: "desc" },
    );
  }

  return (
    <div>
      {zoekbaar ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <input
            type="search"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Filter…"
            aria-label="Filter tabel"
            className="border-border bg-surface h-9 w-full max-w-xs rounded-md border px-3 text-sm"
          />
          <span className="text-foreground-muted shrink-0 text-xs">
            {zichtbaar.length} van {rijen.length}
          </span>
        </div>
      ) : null}
      <div className="border-border overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted text-foreground-muted text-left text-xs tracking-wide uppercase">
            <tr>
              {kolommen.map((k) => (
                <th
                  key={k.key}
                  scope="col"
                  aria-sort={sort?.key === k.key ? (sort.richting === "asc" ? "ascending" : "descending") : "none"}
                  className={`px-3 py-2 font-semibold ${k.type && k.type !== "tekst" ? "text-right" : ""}`}
                >
                  <button type="button" onClick={() => toggle(k.key)} className="hover:text-foreground inline-flex items-center gap-1">
                    {k.label}
                    <span aria-hidden className="text-[10px]">
                      {sort?.key === k.key ? (sort.richting === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {zichtbaar.length === 0 ? (
              <tr>
                <td colSpan={kolommen.length} className="text-foreground-muted px-3 py-6 text-center">
                  {leeg}
                </td>
              </tr>
            ) : (
              zichtbaar.map((rij, i) => (
                <tr key={i} className="bg-surface hover:bg-surface-muted/60">
                  {kolommen.map((k) => (
                    <td key={k.key} className={`px-3 py-2 ${k.type && k.type !== "tekst" ? "text-right tabular-nums" : ""}`}>
                      {toon(rij[k.key] ?? null, k.type)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
