"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero-fotografie als onderdeel van de interface.
 *
 * Eén foto (/images/hero.webp, 1536×1024, originele 3:2-compositie met rustige
 * ruimte links en de twee personen rechts). Op desktop vult de foto de
 * rechter 68% van de hero, van navigatiebalk tot onderrand en tot aan de
 * rechterrand van het scherm. Aan de linkerkant maakt een CSS-masker de foto
 * langzaam zichtbaar vanuit de echte paginakleur (0% → 15% vrijwel niets,
 * 30% duidelijk, 45% volledig), zodat niet te zien is waar de afbeelding
 * technisch begint. De foto is rechts uitgelijnd en op desktop licht vergroot
 * (1.04) vanuit de rechterkant: de rechter persoon komt iets dichterbij en
 * mag net buiten de rand vallen; gezichten en tablet blijven vrij.
 *
 * Laden: opacity 0→1 en scale 1.035→1 (zie .hero-foto in globals.css).
 * Scrollen: parallax van maximaal 8 px. Beide uit bij prefers-reduced-motion.
 */
const FOTO = "/images/hero.webp";
const ALT =
  "Een opdrachtgever en een zzp'er overleggen bij een bestelbus over de planning van een klus.";
const MASKER =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.04) 15%, rgba(0,0,0,0.55) 30%, #000 45%, #000 100%)";

export function HeroFoto() {
  const parallax = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallax.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(8, Math.max(0, window.scrollY * 0.03));
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
    <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[62%] xl:w-[68%]">
      <div ref={parallax} className="absolute inset-0 will-change-transform">
        <div
          className="hero-foto absolute inset-0"
          style={{ WebkitMaskImage: MASKER, maskImage: MASKER }}
        >
          <Image
            src={FOTO}
            alt={ALT}
            fill
            priority
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover object-[100%_35%] lg:object-[100%_30%] lg:scale-[1.04] lg:[transform-origin:100%_40%]"
          />
        </div>
      </div>
    </div>
  );
}
