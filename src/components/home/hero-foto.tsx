"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero-fotografie als onderdeel van de interface.
 *
 * Bron: /images/hero.webp (1536×1024, originele 3:2-compositie: rustige ruimte
 * links, de twee personen rechts). Vanaf xl vult de foto de rechterzijde van
 * de hero, van navigatiebalk tot onderrand en tot aan de rechterrand van het
 * scherm, rechts uitgelijnd op ware grootte (geen zoom, zodat de rechter
 * persoon niet extra wordt afgesneden). De overgang naar het lichte tekstvlak
 * is een kort CSS-masker (180 px) dat uitsluitend over de lege achtergrond
 * links loopt; de contouren van beide personen blijven volledig intact.
 *
 * Laden: opacity 0→1 en scale 1.035→1 (zie .hero-foto in globals.css).
 * Scrollen: parallax van maximaal 8 px. Beide uit bij prefers-reduced-motion.
 */
const FOTO = "/images/hero.webp";
const ALT =
  "Een opdrachtgever en een zzp'er overleggen bij een bestelbus over de planning van een klus.";
const MASKER =
  "linear-gradient(to right, transparent 0px, rgba(0,0,0,0.08) 70px, rgba(0,0,0,0.6) 125px, #000 180px)";

export function HeroFoto() {
  const parallax = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallax.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 1280px)").matches) return;
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
    <div className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[3/2] xl:absolute xl:inset-y-0 xl:right-0 xl:aspect-auto xl:w-[62%] 2xl:w-[58%]">
      <div ref={parallax} className="absolute inset-0 will-change-transform">
        <div className="hero-foto absolute inset-0 xl:[mask-image:var(--hero-masker)] xl:[-webkit-mask-image:var(--hero-masker)]" style={{ ["--hero-masker" as string]: MASKER }}>
          <Image
            src={FOTO}
            alt={ALT}
            fill
            priority
            sizes="(min-width: 1280px) 62vw, 100vw"
            className="object-cover object-[100%_35%] xl:object-[100%_30%]"
          />
        </div>
      </div>
    </div>
  );
}
