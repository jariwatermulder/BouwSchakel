"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PERIODES, type PeriodeKey } from "@/server/analytics/periode";

/** Globale periodefilter; schrijft ?p=… (of ?p=custom&van=…&tot=…) in de URL. */
export function PeriodeFilter({ actief }: { actief: PeriodeKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [custom, setCustom] = useState(actief === "custom");
  const [van, setVan] = useState(sp.get("van") ?? "");
  const [tot, setTot] = useState(sp.get("tot") ?? "");

  function kies(key: PeriodeKey) {
    if (key === "custom") {
      setCustom(true);
      return;
    }
    setCustom(false);
    const q = new URLSearchParams(sp.toString());
    q.set("p", key);
    q.delete("van");
    q.delete("tot");
    router.replace(`${pathname}?${q.toString()}`);
  }

  function pasToe(e: React.FormEvent) {
    e.preventDefault();
    if (!van || !tot) return;
    const q = new URLSearchParams(sp.toString());
    q.set("p", "custom");
    q.set("van", van);
    q.set("tot", tot);
    router.replace(`${pathname}?${q.toString()}`);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div role="group" aria-label="Periode" className="border-border bg-surface inline-flex flex-wrap gap-0.5 rounded-lg border p-0.5">
        {PERIODES.map((p) => {
          const isActief = p.key === actief && !(custom && p.key !== "custom");
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => kies(p.key)}
              aria-pressed={isActief || (custom && p.key === "custom")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                isActief || (custom && p.key === "custom")
                  ? "bg-ink text-white"
                  : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      {custom ? (
        <form onSubmit={pasToe} className="flex items-center gap-2">
          <label className="sr-only" htmlFor="periode-van">Van</label>
          <input
            id="periode-van"
            type="date"
            value={van}
            max={tot || undefined}
            onChange={(e) => setVan(e.target.value)}
            className="border-border bg-surface h-9 rounded-md border px-2 text-sm"
            required
          />
          <span className="text-foreground-muted text-sm">t/m</span>
          <label className="sr-only" htmlFor="periode-tot">Tot en met</label>
          <input
            id="periode-tot"
            type="date"
            value={tot}
            min={van || undefined}
            onChange={(e) => setTot(e.target.value)}
            className="border-border bg-surface h-9 rounded-md border px-2 text-sm"
            required
          />
          <button type="submit" className="bg-brand-500 hover:bg-brand-600 h-9 rounded-md px-3 text-sm font-semibold text-white">
            Toepassen
          </button>
        </form>
      ) : null}
    </div>
  );
}
