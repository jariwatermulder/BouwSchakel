import * as React from "react";

/**
 * Compacte lijn-iconen (stroke) voor feature-, sector- en vertrouwenskaarten.
 * Pure presentatie, veilig in zowel server- als client-componenten.
 */
export function Icon({ name, className }: { name: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    doc: (
      <>
        <path d="M8 3h6l4 4v14H6V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v4h4" />
        <path d="M9 13h6M9 17h4" />
      </>
    ),
    match: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    chat: (
      <>
        <path d="M4 5h16v11H9l-4 4v-4H4V5Z" />
        <path d="M8 10h8M8 13h5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    star: (
      <path d="M12 4l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 15.9 7.4 18.3l.9-5.1L4.5 9.5l5.2-.8L12 4Z" />
    ),
    bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.6-3.6" />
      </>
    ),
    euro: (
      <>
        <path d="M17 6.5a6 6 0 1 0 0 11" />
        <path d="M4 10.5h9M4 13.5h8" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4.5l3 1.8" />
      </>
    ),
    lightbulb: (
      <>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.2 1 2.5h6c0-1.3.3-1.8 1-2.5A6 6 0 0 0 12 3Z" />
      </>
    ),
    hammer: (
      <>
        <path d="M14.5 4 20 9.5 17.5 12 12 6.5 14.5 4Z" />
        <path d="M12.8 7.3 4 16v4h4l8.7-8.7" />
      </>
    ),
    wrench: (
      <path d="M20 6.5a3.5 3.5 0 0 1-4.6 4.6L7 19.5 4.5 17l8.4-8.4A3.5 3.5 0 0 1 17.5 4l-2.3 2.3 2 2L20 6.5Z" />
    ),
    truck: (
      <>
        <path d="M3 6h11v9H3z" />
        <path d="M14 9h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.7" />
        <circle cx="17" cy="18" r="1.7" />
      </>
    ),
    leaf: (
      <>
        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z" />
        <path d="M5 19c4-4 7-7 11-9" />
      </>
    ),
    cup: (
      <>
        <path d="M5 8h11v5a5.5 5.5 0 0 1-11 0z" />
        <path d="M16 9h2.5a2 2 0 0 1 0 4H16" />
        <path d="M5 20h11" />
      </>
    ),
    heart: (
      <path d="M12 20s-7-4.4-7-9.4A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7 2.6C19 15.6 12 20 12 20Z" />
    ),
    code: (
      <>
        <path d="M8 8l-4 4 4 4" />
        <path d="M16 8l4 4-4 4" />
        <path d="M13.5 6l-3 12" />
      </>
    ),
    folder: <path d="M3 7h6l2 2h10v9H3z" />,
    pin: (
      <>
        <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
        <circle cx="12" cy="11" r="2.3" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </>
    ),
    palette: (
      <>
        <path d="M12 3a9 9 0 1 0 0 18c1.4 0 1.9-1 1.4-2s.1-2 1.6-2H18a3 3 0 0 0 3-3 8.5 8.5 0 0 0-9-8Z" />
        <circle cx="8" cy="12" r="1" />
        <circle cx="12" cy="8" r="1" />
        <circle cx="16" cy="12" r="1" />
      </>
    ),
    ticket: (
      <>
        <rect x="3" y="7" width="18" height="10" rx="2" />
        <path d="M13 7v10" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

/**
 * Vlakke portret-illustratie (geen foto van een echt persoon). Twee varianten
 * met een eigen kleur- en haarpalet, zodat opdrachtgever en zzp'er duidelijk
 * verschillende personen zijn.
 */
export function PersonPortrait({
  variant,
}: {
  variant: "opdrachtgever" | "zzper";
}) {
  const cfg =
    variant === "opdrachtgever"
      ? {
          bg: "#eef3fb",
          skin: "#f1c9a5",
          hair: "#2b2f38",
          clothing: "#22467f",
          collar: "#1a3763",
          glasses: true,
        }
      : {
          bg: "#fff4e2",
          skin: "#e6b184",
          hair: "#4a3520",
          clothing: "#d97706",
          collar: "#b45309",
          glasses: false,
        };
  const id = variant;
  return (
    <svg viewBox="0 0 160 160" aria-hidden className="h-full w-full">
      <defs>
        <clipPath id={`clip-${id}`}>
          <circle cx="80" cy="80" r="80" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <rect width="160" height="160" fill={cfg.bg} />
        <path
          d="M24 160 C24 120 50 106 80 106 C110 106 136 120 136 160 Z"
          fill={cfg.clothing}
        />
        <path d="M66 110 L80 126 L94 110 L88 106 L72 106 Z" fill={cfg.collar} />
        <rect x="70" y="90" width="20" height="22" rx="8" fill={cfg.skin} />
        <circle cx="51" cy="72" r="6" fill={cfg.skin} />
        <circle cx="109" cy="72" r="6" fill={cfg.skin} />
        <ellipse cx="80" cy="70" rx="30" ry="33" fill={cfg.skin} />
        <path
          d="M49 68 C46 40 66 29 80 29 C94 29 114 40 111 68 C110 55 99 48 80 48 C61 48 50 55 49 68 Z"
          fill={cfg.hair}
        />
        <path
          d="M64 62 q6 -4 12 0"
          stroke={cfg.hair}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M84 62 q6 -4 12 0"
          stroke={cfg.hair}
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="70" cy="71" r="3" fill="#1f2937" />
        <circle cx="90" cy="71" r="3" fill="#1f2937" />
        <path
          d="M70 85 q10 8 20 0"
          stroke="#b0693f"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        {cfg.glasses ? (
          <g stroke="#1f2937" strokeWidth="2.4" fill="none">
            <circle cx="70" cy="71" r="8.5" />
            <circle cx="90" cy="71" r="8.5" />
            <path d="M78.5 71 h3" />
          </g>
        ) : null}
      </g>
      <circle
        cx="80"
        cy="80"
        r="79"
        fill="none"
        stroke="rgba(11,18,32,0.06)"
        strokeWidth="2"
      />
    </svg>
  );
}
