import { cn } from "@/lib/utils";

/**
 * Officiële ZZP Schakel-logo (beeldmerk + woordmerk als één afbeelding).
 * Witte versie voor de blauwe navigatiebalk en donkere achtergronden.
 *
 * Bron: /public/brand/ZZP-Schakel-header-wit.png (1424×539). Daarvan zijn
 * exacte verkleiningen gemaakt op 160/320/480 px (1x/2x/3x) zodat de letters
 * scherp blijven; de browser kiest per schermdichtheid. Altijd op verhouding,
 * nooit bijgesneden, opnieuw getekend of anders gekleurd.
 */
const BASIS = "/brand/ZZP-Schakel-header-wit";

export function Logo({
  className,
  priority = false,
}: {
  /** Breedte via Tailwind-klassen, bijv. "w-[132px] md:w-[156px]". */
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- vaste, vooraf verkleinde varianten; geen optimalisatie gewenst
    <img
      src={`${BASIS}@2x.png`}
      srcSet={`${BASIS}@1x.png 1x, ${BASIS}@2x.png 2x, ${BASIS}@3x.png 3x`}
      alt="ZZP Schakel"
      width={320}
      height={121}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={cn("h-auto w-[132px] object-contain md:w-[156px]", className)}
    />
  );
}
