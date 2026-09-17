import { cn } from "@/lib/utils";

/**
 * ZZP Schakel-logo: twee in elkaar grijpende schakels (mark) + wordmark.
 * - variant "color": donkere achterste schakel + blauwe voorste, "ZZP" donker,
 *   "SCHAKEL" blauw. Voor lichte achtergronden.
 * - variant "white": volledig wit (achterste schakel iets transparant voor
 *   diepte). Voor de blauwe balk en de donkere footer.
 * Inline SVG zodat hij scherp schaalt en geen image-loader nodig heeft.
 */
// Brandguide: kobaltblauw #2563EB en antraciet #18212B.
const BLUE = "#2563eb";
const DARK = "#18212b";

export function LogoMark({
  variant = "color",
  className,
}: {
  variant?: "color" | "white";
  className?: string;
}) {
  const back = variant === "white" ? "rgba(255,255,255,0.62)" : DARK;
  const front = variant === "white" ? "#ffffff" : BLUE;
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden
      className={cn("h-10 w-10 shrink-0", className)}
      fill="none"
      strokeWidth="6"
      strokeLinecap="round"
    >
      <defs>
        <clipPath id="zzps-interlock">
          <circle cx="20" cy="20" r="6" />
        </clipPath>
      </defs>
      {/* achterste schakel */}
      <rect
        x="3"
        y="22"
        width="30"
        height="16"
        rx="8"
        stroke={back}
        transform="rotate(-45 18 30)"
      />
      {/* voorste schakel */}
      <rect
        x="15"
        y="10"
        width="30"
        height="16"
        rx="8"
        stroke={front}
        transform="rotate(-45 30 18)"
      />
      {/* achterste schakel nogmaals, alleen op de bovenste kruising: interlock */}
      <rect
        x="3"
        y="22"
        width="30"
        height="16"
        rx="8"
        stroke={back}
        transform="rotate(-45 18 30)"
        clipPath="url(#zzps-interlock)"
      />
    </svg>
  );
}

export function Logo({
  variant = "color",
  className,
}: {
  variant?: "color" | "white";
  className?: string;
}) {
  const white = variant === "white";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark variant={variant} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[12px] font-extrabold tracking-[0.22em]",
            white ? "text-white/85" : "text-ink",
          )}
        >
          ZZP
        </span>
        <span
          className={cn(
            "text-[26px] font-extrabold tracking-tight",
            white ? "text-white" : "text-brand-500",
          )}
        >
          SCHAKEL
        </span>
      </span>
    </span>
  );
}
