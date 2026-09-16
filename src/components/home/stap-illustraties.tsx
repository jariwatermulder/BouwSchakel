/**
 * Vlakke, schaalbare illustraties voor de drie "Zo werkt het"-stappen,
 * in de ZZP Connect huisstijl (Connect Blue op lichtblauw). Puur SVG, geen
 * externe afbeeldingen — scherp op elk formaat en licht van gewicht.
 */

const BLUE = "#2563eb";
const BLUE_DK = "#1e40af";
const LIGHT = "#eaf1ff";
const LINE = "#d6dee8";
const LINE2 = "#c3cede";

type Props = { className?: string };

/** Stap 1 — Zoeken: telefoon met zoekvelden en resultaten. */
export function ZoekIllustratie({ className }: Props) {
  return (
    <svg viewBox="0 0 260 170" className={className} role="img" aria-label="Zoeken op vakgebied en plaats">
      <circle cx="130" cy="85" r="82" fill={LIGHT} />
      <g>
        <rect x="86" y="20" width="88" height="150" rx="16" fill="#fff" stroke={LINE} />
        {/* zoekvelden */}
        <rect x="96" y="34" width="68" height="16" rx="8" fill="#fff" stroke={LINE} />
        <circle cx="105" cy="42" r="3" fill="none" stroke={BLUE} strokeWidth="1.6" />
        <line x1="107.2" y1="44.2" x2="109" y2="46" stroke={BLUE} strokeWidth="1.6" strokeLinecap="round" />
        <rect x="112" y="39" width="34" height="6" rx="3" fill={LINE2} />
        <rect x="96" y="54" width="68" height="16" rx="8" fill="#fff" stroke={LINE} />
        <path d="M105 60c2 0 3 1.6 3 3.2 0 2-3 4.8-3 4.8s-3-2.8-3-4.8C102 61.6 103 60 105 60z" fill="none" stroke={BLUE} strokeWidth="1.4" />
        <rect x="112" y="59" width="30" height="6" rx="3" fill={LINE2} />
        {/* knop */}
        <rect x="96" y="76" width="68" height="18" rx="9" fill={BLUE} />
        <rect x="118" y="82" width="24" height="6" rx="3" fill="#fff" />
        {/* resultaten */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(96 ${102 + i * 20})`}>
            <rect width="68" height="16" rx="6" fill="#fff" stroke={LINE} />
            <rect x="7" y="4.5" width="8" height="8" rx="2" fill={LIGHT} stroke={BLUE} strokeWidth="1" />
            <rect x="20" y="6.5" width="38" height="4" rx="2" fill={LINE2} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Stap 2 — Bekijk profiel: profielkaart met vakgebied, plaats en ervaring. */
export function ProfielIllustratie({ className }: Props) {
  return (
    <svg viewBox="0 0 260 170" className={className} role="img" aria-label="Bekijk profielen van vakmensen">
      <circle cx="130" cy="85" r="82" fill={LIGHT} />
      <rect x="66" y="42" width="128" height="86" rx="12" fill="#fff" stroke={LINE} />
      {/* avatar + naam + sterren */}
      <circle cx="90" cy="66" r="12" fill={LIGHT} stroke={BLUE} strokeWidth="1.4" />
      <circle cx="90" cy="62" r="4" fill={BLUE} />
      <path d="M82 72c1.5-4 15-4 16 0" fill={BLUE} />
      <rect x="110" y="58" width="40" height="6" rx="3" fill={LINE2} />
      <g fill={BLUE}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            transform={`translate(${110 + i * 11} 70)`}
            d="M4 0l1.2 2.5 2.8.4-2 2 .5 2.7L4 6.3 1.5 7.6 2 4.9 0 2.9l2.8-.4z"
          />
        ))}
      </g>
      {/* regels: hamer / pin / koffer */}
      {[
        { y: 92, label: "Timmerman" },
        { y: 104, label: "Groningen (50 km)" },
        { y: 116, label: "5+ jaar ervaring" },
      ].map((r, i) => (
        <g key={i}>
          <rect x="80" y={r.y} width="10" height="10" rx="2" fill={LIGHT} />
          <rect x="96" y={r.y + 3} width={i === 1 ? 78 : i === 2 ? 66 : 48} height="4.5" rx="2.25" fill={LINE2} />
        </g>
      ))}
      {/* iconhints in de vierkantjes */}
      <path d="M83 96l2-2 2 2-2 2z" fill={BLUE} />
      <circle cx="85" cy="108" r="2.4" fill="none" stroke={BLUE} strokeWidth="1.3" />
      <rect x="82.5" y="118.5" width="5" height="4" rx="1" fill="none" stroke={BLUE} strokeWidth="1.2" />
    </svg>
  );
}

/** Stap 3 — Contact: kaart met "Bericht sturen" en telefoon/WhatsApp. */
export function ContactIllustratie({ className }: Props) {
  return (
    <svg viewBox="0 0 260 170" className={className} role="img" aria-label="Neem rechtstreeks contact op">
      <circle cx="130" cy="85" r="82" fill={LIGHT} />
      <rect x="66" y="40" width="128" height="92" rx="12" fill="#fff" stroke={LINE} />
      {/* avatar + sterren */}
      <circle cx="90" cy="62" r="12" fill={LIGHT} stroke={BLUE} strokeWidth="1.4" />
      <circle cx="90" cy="58" r="4" fill={BLUE} />
      <path d="M82 68c1.5-4 15-4 16 0" fill={BLUE} />
      <rect x="110" y="54" width="42" height="6" rx="3" fill={LINE2} />
      <g fill={BLUE}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            transform={`translate(${110 + i * 11} 66)`}
            d="M4 0l1.2 2.5 2.8.4-2 2 .5 2.7L4 6.3 1.5 7.6 2 4.9 0 2.9l2.8-.4z"
          />
        ))}
      </g>
      {/* Bericht sturen-knop */}
      <rect x="80" y="88" width="100" height="20" rx="10" fill={BLUE} />
      <path d="M92 98c0-3 3-5 7-5s7 2 7 5-3 5-7 5c-1 0-2 0-3-.4l-3 1 .8-2.2C93 105 92 102 92 98z" fill="#fff" opacity="0.95" />
      <rect x="112" y="95" width="56" height="6" rx="3" fill="#fff" />
      {/* kleine knoppen: telefoon + whatsapp */}
      <rect x="80" y="114" width="46" height="14" rx="7" fill="#fff" stroke={LINE} />
      <path d="M99 118.5c1.2 0 1.6 2.2 1 3-.2.3.1.9.6 1.3.5.4 1.1.6 1.4.4.8-.6 3 .2 3 1.3 0 1.4-2 2-3.6 1.2-1.9-1-3.5-2.6-4.4-4.5-.6-1.3.3-2.7 2-2.7z" fill={BLUE} />
      <rect x="134" y="114" width="46" height="14" rx="7" fill="#fff" stroke={LINE} />
      <circle cx="157" cy="121" r="4.6" fill="none" stroke={BLUE} strokeWidth="1.4" />
      <path d="M155 119.5c.6 1.6 1.4 2.4 3 3l-1 .8c-1.4-.4-2.4-1.4-2.8-2.8z" fill={BLUE} />
      {/* verzend-badge */}
      <circle cx="182" cy="46" r="14" fill={BLUE_DK} />
      <path d="M176 46l12-4-4 12-2.5-4.5z" fill="#fff" />
    </svg>
  );
}
