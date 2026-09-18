import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Officiële ZZP Schakel-logo (beeldmerk + woordmerk als één afbeelding).
 * Witte versie voor de blauwe navigatiebalk en donkere achtergronden:
 * /public/brand/ZZP-Schakel-header-wit.png (1424×539). Altijd op verhouding,
 * nooit bijgesneden of opnieuw getekend.
 */
const LOGO_WIT = "/brand/ZZP-Schakel-header-wit.png";
const BREEDTE = 1424;
const HOOGTE = 539;

export function Logo({
  className,
  priority = false,
}: {
  /** Breedte via Tailwind-klassen, bijv. "w-[132px] md:w-[158px]". */
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={LOGO_WIT}
      alt="ZZP Schakel"
      width={BREEDTE}
      height={HOOGTE}
      priority={priority}
      sizes="(min-width: 768px) 160px, 140px"
      className={cn("h-auto w-[132px] object-contain md:w-[156px]", className)}
    />
  );
}
