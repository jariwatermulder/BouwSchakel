import Image from "next/image";
import { publiekeUrl } from "@/lib/storage/url";

/** Profielfoto of, zonder foto, de initialen op een donkere cirkel. */
export function Avatar({
  fotoKey,
  naam,
  size = 44,
  className = "",
}: {
  fotoKey: string | null | undefined;
  naam: string;
  size?: number;
  className?: string;
}) {
  const initialen = naam.replace(/[^\p{L}\p{N} ]/gu, "").trim().slice(0, 2).toUpperCase() || "?";
  if (fotoKey) {
    return (
      <Image
        src={publiekeUrl(fotoKey)}
        alt={`Profielfoto van ${naam}`}
        width={size}
        height={size}
        unoptimized
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`bg-ink flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.34)) }}
    >
      {initialen}
    </span>
  );
}
