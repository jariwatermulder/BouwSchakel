"use client";

import * as React from "react";
import { Icon, PersonPortrait } from "./pictos";

/** Pool met opdrachten uit verschillende sectoren; rouleren in beeld. */
const POOL = [
  { vak: "Timmerman", plaats: "Groningen", pct: 96, icon: "hammer", kleur: "#f59e0b" },
  { vak: "Verpleegkundige", plaats: "Zwolle", pct: 93, icon: "heart", kleur: "#db2777" },
  { vak: "Softwareontwikkelaar", plaats: "Utrecht", pct: 90, icon: "code", kleur: "#7c3aed" },
  { vak: "Elektricien", plaats: "Amersfoort", pct: 94, icon: "wrench", kleur: "#2563eb" },
  { vak: "Chauffeur (C)", plaats: "Leeuwarden", pct: 88, icon: "truck", kleur: "#4f46e5" },
  { vak: "Kok", plaats: "Deventer", pct: 91, icon: "cup", kleur: "#e11d48" },
  { vak: "Hovenier", plaats: "Assen", pct: 89, icon: "leaf", kleur: "#16a34a" },
  { vak: "Schoonmaker", plaats: "Meppel", pct: 92, icon: "star", kleur: "#06b6d4" },
  { vak: "Online marketeer", plaats: "Zwolle", pct: 87, icon: "palette", kleur: "#c026d3" },
];

/** Handige, eerlijke weetjes — geen verzonnen cijfers. */
const TIPS = [
  "Tip: vul je certificaten in — dat verbetert je matches.",
  "Wist je dat? Jij bepaalt zelf je uurtarief en werkgebied.",
  "Elke match komt mét uitleg waarom iemand past.",
  "Reviews kunnen alleen ná een echte opdracht.",
  "Je sluit de overeenkomst rechtstreeks met de zzp’er.",
  "Zet ZZP Connect met één tik op je startscherm.",
];

const ROW_COUNT = 3;

export function HeroBoard() {
  const [start, setStart] = React.useState(0);
  const [tip, setTip] = React.useState(0);
  const reduced = React.useRef(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    if (mq.matches) return; // geen auto-rotatie bij reduced motion
    const rowTimer = setInterval(
      () => setStart((s) => (s + 1) % POOL.length),
      2800,
    );
    const tipTimer = setInterval(
      () => setTip((t) => (t + 1) % TIPS.length),
      4200,
    );
    return () => {
      clearInterval(rowTimer);
      clearInterval(tipTimer);
    };
  }, []);

  const rows = Array.from(
    { length: ROW_COUNT },
    (_, k) => POOL[(start + k) % POOL.length]!,
  );

  return (
    <div
      className="bs-load relative w-full max-w-md"
      style={{ animationDelay: "260ms" }}
    >
      {/* Zwevende, kleurrijke sector-labels */}
      {[
        { label: "Horeca", kleur: "#e11d48", pos: "-left-3 top-10", delay: "0s" },
        { label: "Transport", kleur: "#4f46e5", pos: "-right-4 top-1/3", delay: "1.2s" },
        { label: "Groen", kleur: "#16a34a", pos: "-left-2 bottom-16", delay: "0.6s" },
      ].map((c) => (
        <span
          key={c.label}
          aria-hidden
          className={`bs-float-chip shadow-soft absolute z-20 hidden rounded-full px-3 py-1.5 text-xs font-bold text-white sm:inline-flex ${c.pos}`}
          style={{ backgroundColor: c.kleur, animationDelay: c.delay }}
        >
          {c.label}
        </span>
      ))}

      <div className="bs-float-card border-border bg-surface shadow-elevated relative z-10 rounded-[var(--radius-card)] border p-5">
        {/* Kopregel */}
        <div className="flex items-center justify-between">
          <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="bs-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            Live matches
          </span>
          <span className="text-foreground-muted text-xs font-medium">
            in elke sector
          </span>
        </div>

        {/* Match-rijen; wisselen elke paar seconden van inhoud */}
        <div key={start} className="mt-4 space-y-2.5">
          {rows.map((r, i) => (
            <div
              key={`${start}-${i}`}
              className="bs-load border-border rounded-2xl border p-3"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${r.kleur}1a`, color: r.kleur }}
                >
                  <Icon name={r.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {r.vak}
                  </p>
                  <p className="text-foreground-muted text-xs">{r.plaats}</p>
                </div>
                <span
                  className="shrink-0 text-sm font-bold"
                  style={{ color: r.kleur }}
                >
                  {r.pct}%
                </span>
              </div>
              <div className="bg-surface-muted mt-2 h-1.5 overflow-hidden rounded-full">
                <div
                  className="bs-fill h-full rounded-full"
                  style={
                    { background: r.kleur, "--bs-w": `${r.pct}%` } as React.CSSProperties
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rouleren feitje / tip */}
        <div className="bg-navy-800 mt-4 flex items-start gap-2.5 rounded-2xl p-3 text-white">
          <span className="text-accent-400 mt-0.5 shrink-0">
            <Icon name="lightbulb" className="h-4 w-4" />
          </span>
          <p key={tip} className="bs-msg-in text-navy-100 text-xs leading-relaxed">
            {TIPS[tip]}
          </p>
        </div>

        {/* De twee personen blijven in beeld */}
        <div className="mt-3 flex items-center gap-3 px-1">
          <div className="flex -space-x-3">
            <span className="ring-surface h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2">
              <PersonPortrait variant="opdrachtgever" />
            </span>
            <span className="ring-surface h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2">
              <PersonPortrait variant="zzper" />
            </span>
          </div>
          <p className="text-foreground-muted flex-1 text-xs">
            Opdrachtgever en zzp’er direct verbonden
          </p>
        </div>
      </div>
    </div>
  );
}
