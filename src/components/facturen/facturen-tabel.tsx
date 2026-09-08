"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  datumKortNL,
  effectieveStatus,
  euro,
  STATUS_META,
} from "@/lib/factuur";
import { dupliceerFactuurAction } from "./actions";

export type FactuurRij = {
  id: string;
  nummer: string;
  klant: string;
  datum: string; // ISO
  vervaldatum: string | null;
  totaalCents: number;
  status: string;
};

const SORTS = {
  datum_desc: "Datum (nieuw → oud)",
  datum_asc: "Datum (oud → nieuw)",
  bedrag_desc: "Bedrag (hoog → laag)",
  bedrag_asc: "Bedrag (laag → hoog)",
} as const;

export function FacturenTabel({
  facturen,
  basisPad,
}: {
  facturen: FactuurRij[];
  basisPad: string;
}) {
  const [zoek, setZoek] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<keyof typeof SORTS>("datum_desc");

  const rijen = useMemo(() => {
    const term = zoek.trim().toLowerCase();
    let r = facturen.map((f) => ({
      ...f,
      eff: effectieveStatus(f.status, f.vervaldatum ? new Date(f.vervaldatum) : null),
    }));
    if (term) {
      r = r.filter(
        (f) =>
          f.nummer.toLowerCase().includes(term) ||
          f.klant.toLowerCase().includes(term),
      );
    }
    if (status) r = r.filter((f) => f.eff === status);
    r.sort((a, b) => {
      switch (sort) {
        case "datum_asc":
          return a.datum.localeCompare(b.datum);
        case "bedrag_desc":
          return b.totaalCents - a.totaalCents;
        case "bedrag_asc":
          return a.totaalCents - b.totaalCents;
        default:
          return b.datum.localeCompare(a.datum);
      }
    });
    return r;
  }, [facturen, zoek, status, sort]);

  const veld =
    "border-border bg-surface focus-visible:border-navy-500 h-10 rounded-lg border px-3 text-sm outline-none";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={zoek}
          onChange={(e) => setZoek(e.target.value)}
          placeholder="Zoek op nummer of klant…"
          aria-label="Zoeken"
          className={`${veld} min-w-[200px] flex-1`}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter op status"
          className={veld}
        >
          <option value="">Alle statussen</option>
          {Object.entries(STATUS_META).map(([w, m]) => (
            <option key={w} value={w}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as keyof typeof SORTS)}
          aria-label="Sorteren"
          className={veld}
        >
          {Object.entries(SORTS).map(([w, label]) => (
            <option key={w} value={w}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {rijen.length === 0 ? (
        <div className="border-border text-foreground-muted mt-4 rounded-[var(--radius-card)] border border-dashed p-8 text-center text-sm">
          Geen facturen gevonden.
        </div>
      ) : (
        <div className="border-border mt-4 overflow-x-auto rounded-[var(--radius-card)] border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface-muted text-foreground-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nummer</th>
                <th className="px-4 py-3 text-left font-medium">Klant</th>
                <th className="px-4 py-3 text-left font-medium">Datum</th>
                <th className="px-4 py-3 text-left font-medium">Vervaldatum</th>
                <th className="px-4 py-3 text-right font-medium">Bedrag</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Acties</th>
              </tr>
            </thead>
            <tbody>
              {rijen.map((f) => {
                const meta = STATUS_META[f.eff] ?? STATUS_META.CONCEPT!;
                return (
                  <tr key={f.id} className="border-border border-t">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`${basisPad}/${f.id}`}
                        className="hover:text-accent-600"
                      >
                        {f.nummer}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{f.klant}</td>
                    <td className="text-foreground-muted px-4 py-3">
                      {datumKortNL(f.datum)}
                    </td>
                    <td className="text-foreground-muted px-4 py-3">
                      {f.vervaldatum ? datumKortNL(f.vervaldatum) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {euro(f.totaalCents)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.klasse}`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: meta.dot }}
                        />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`${basisPad}/${f.id}`}
                          className="text-navy-700 hover:underline"
                        >
                          Open
                        </Link>
                        <a
                          href={`${basisPad}/${f.id}/pdf`}
                          className="text-accent-600 hover:underline"
                        >
                          PDF
                        </a>
                        <form action={dupliceerFactuurAction}>
                          <input type="hidden" name="id" value={f.id} />
                          <input type="hidden" name="basisPad" value={basisPad} />
                          <button
                            type="submit"
                            className="text-foreground-muted hover:text-foreground"
                          >
                            Dupliceer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
