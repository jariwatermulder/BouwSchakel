"use client";

import { useEffect, useState } from "react";
import type { ActiviteitItem } from "@/server/analytics/queries";

function relatief(iso: string, nu: number): string {
  const sec = Math.max(0, Math.round((nu - new Date(iso).getTime()) / 1000));
  if (sec < 45) return "zojuist";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min geleden`;
  const uur = Math.round(min / 60);
  if (uur < 24) return `${uur} uur geleden`;
  const dag = Math.round(uur / 24);
  return dag === 1 ? "gisteren" : `${dag} dagen geleden`;
}

const KLEUR: Record<string, string> = {
  zzper_registered: "bg-emerald-500",
  company_registered: "bg-emerald-500",
  contact_request_sent: "bg-brand-500",
  message_sent: "bg-brand-500",
  search_performed: "bg-navy-400",
  profile_viewed: "bg-navy-300",
  profile_reported: "bg-red-500",
};

/**
 * Live activiteitenfeed. Geen websockets: de server ondersteunt geen push,
 * dus we halen elke 10 seconden nieuwe events op (alleen als het tabblad
 * zichtbaar is). Toont uitsluitend pseudonieme, samengevatte activiteit.
 */
export function LiveFeed({ initieel, compact = false }: { initieel: ActiviteitItem[]; compact?: boolean }) {
  const [items, setItems] = useState(initieel);
  // Relatieve tijd pas in de browser bepalen (server en client zouden anders
  // verschillende tekst renderen).
  const [nu, setNu] = useState<number | null>(null);
  const [fout, setFout] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setNu(Date.now()), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    let actief = true;
    const haal = async () => {
      if (document.visibilityState !== "visible") return;
      const sinds = items[0]?.tijd;
      try {
        const r = await fetch(`/api/admin/activiteit${sinds ? `?sinds=${encodeURIComponent(sinds)}` : ""}`, { cache: "no-store" });
        if (!r.ok) throw new Error(String(r.status));
        const nieuw = (await r.json()) as ActiviteitItem[];
        if (!actief) return;
        setFout(false);
        if (nieuw.length) setItems((oud) => [...nieuw, ...oud].slice(0, compact ? 12 : 80));
      } catch {
        if (actief) setFout(true);
      }
      setNu(Date.now());
    };
    const id = window.setInterval(haal, 10_000);
    const tik = window.setInterval(() => setNu(Date.now()), 15_000);
    return () => {
      actief = false;
      window.clearInterval(id);
      window.clearInterval(tik);
    };
  }, [items, compact]);

  return (
    <div>
      <p className="text-foreground-muted mb-3 flex items-center gap-2 text-xs">
        <span className={`inline-block h-2 w-2 rounded-full ${fout ? "bg-amber-500" : "bg-emerald-500"}`} />
        {fout ? "Verbinding onderbroken, opnieuw proberen…" : "Elke 10 seconden bijgewerkt"}
      </p>
      {items.length === 0 ? (
        <p className="text-foreground-muted text-sm">Nog geen activiteit gemeten.</p>
      ) : (
        <ol className="space-y-2">
          {items.slice(0, compact ? 8 : 80).map((it) => (
            <li key={it.id} className="flex items-start gap-3 text-sm">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KLEUR[it.event] ?? "bg-border"}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-foreground">{it.tekst}</p>
                <p className="text-foreground-muted text-xs">
                  <time dateTime={it.tijd} title={nu != null ? new Date(it.tijd).toLocaleString("nl-NL") : undefined}>
                    {nu != null ? relatief(it.tijd, nu) : "…"}
                  </time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
