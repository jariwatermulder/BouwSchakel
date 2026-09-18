"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero-fotografie als onderdeel van de interface.
 *
 * Eén foto (/images/hero.webp), twee lagen die pixel-exact over elkaar liggen:
 * - basislaag: de foto binnen een afgerond kader (clip-path);
 * - voorgrondlaag: dezelfde foto, met een zacht masker rond de twee personen.
 *   Alleen daar loopt de foto door buiten het kader, zodat hoofden en
 *   schouders boven de kaderrand uitkomen — zonder cut-out of harde rand.
 * Daarachter een lichtblauw vlak voor diepte, links een fade naar de
 * paginakleur. Bij scrollen een subtiele parallax (max. 36 px), uit bij
 * prefers-reduced-motion.
 *
 * De doos heeft altijd verhouding 5:4 en de foto
 * staat rechts uitgelijnd, zodat de uitsnede — en dus de positie van de
 * personen voor het masker — op elk scherm gelijk blijft.
 */
const FOTO = "/images/hero.webp";
const ALT =
  "Een opdrachtgever en een zzp'er overleggen bij een bestelbus over de planning van een klus.";
const KADER = "inset(22% 4% 0 12% round 2.5rem)";
// Zachte ovalen rond hoofd en schouders van beide personen (in doos-coördinaten).
const MASKER = {
  image: [
    "radial-gradient(12% 27% at 43% 25%, #000 52%, rgba(0,0,0,0.6) 76%, transparent 100%)",
    "radial-gradient(14% 30% at 74% 21%, #000 52%, rgba(0,0,0,0.6) 76%, transparent 100%)",
    // het kader zelf, zodat halo en kader naadloos in elkaar overlopen
    "linear-gradient(#000, #000)",
  ].join(", "),
  size: "100% 100%, 100% 100%, 84% 78%",
  position: "0 0, 0 0, 100% 100%",
  repeat: "no-repeat",
};

export function HeroFoto() {
  const parallax = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallax.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(36, Math.max(0, window.scrollY * 0.06));
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative aspect-[5/4] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:w-auto">
      <div ref={parallax} className="absolute inset-0 will-change-transform">
        <div className="hero-foto absolute inset-0">
          {/* Dieptevlak achter het kader */}
          <div
            aria-hidden
            className="bg-brand-50 absolute rounded-[3rem]"
            style={{ top: "13%", left: "26%", right: 0, bottom: "-10%" }}
          />
          {/* Zachte schaduw onder het kader */}
          <div
            aria-hidden
            className="absolute rounded-[2.5rem] shadow-[0_32px_64px_-24px_rgba(24,33,43,0.35)]"
            style={{ top: "22%", left: "12%", right: "4%", bottom: 0 }}
          />
          {/* Basislaag: foto in het kader */}
          <Image
            src={FOTO}
            alt={ALT}
            fill
            priority
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="object-cover object-[100%_50%]"
            style={{ clipPath: KADER }}
          />
          {/* Voorgrondlaag: dezelfde foto, alleen rond de personen zichtbaar */}
          <Image
            src={FOTO}
            alt=""
            aria-hidden
            fill
            priority
            sizes="(min-width: 1024px) 1000px, 100vw"
            className="object-cover object-[100%_50%]"
            style={{
              WebkitMaskImage: MASKER.image,
              maskImage: MASKER.image,
              WebkitMaskSize: MASKER.size,
              maskSize: MASKER.size,
              WebkitMaskPosition: MASKER.position,
              maskPosition: MASKER.position,
              WebkitMaskRepeat: MASKER.repeat,
              maskRepeat: MASKER.repeat,
            }}
          />
          {/* Overgang naar de lichte paginakleur (links) */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[52%]"
            style={{
              background:
                "linear-gradient(to right, var(--color-surface) 0%, var(--color-surface) 24%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.35) 75%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
