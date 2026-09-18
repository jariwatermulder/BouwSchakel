"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * Hero-fotografie: één foto (/images/hero.webp) die op desktop de volledige
 * rechterzijde vult, van de navigatiebalk tot de onderrand en tot aan de
 * rechterrand van het scherm. Links loopt de foto met een zachte fade over in
 * de lichte paginakleur; geen kader, geen rechte scheidingslijn. De foto is
 * rechts uitgelijnd en iets ingezoomd zodat de twee personen groot en scherp
 * in beeld staan. Fade-in met minieme uitzoom bij laden, subtiele parallax
 * (max. 36 px) bij scrollen; beide uit bij prefers-reduced-motion.
 */
const FOTO = "/images/hero.webp";
const ALT =
  "Een opdrachtgever en een zzp'er overleggen bij een bestelbus over de planning van een klus.";

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
    <div className="relative aspect-[4/3] w-full overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:left-[30%] lg:aspect-auto lg:w-auto">
      <div ref={parallax} className="absolute inset-0 will-change-transform">
        <div className="hero-foto absolute inset-0 lg:-inset-y-[3%]">
          <Image
            src={FOTO}
            alt={ALT}
            fill
            priority
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover object-[100%_28%] lg:object-[96%_30%] lg:scale-[1.08] lg:[transform-origin:96%_30%]"
          />
        </div>
      </div>
      {/* Zachte overgang naar de lichte paginakleur (links, alleen naast de tekst).
          Op lg (1024–1279 px) staat de tekst dichter op de personen: bredere fade. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[52%] lg:block xl:hidden"
        style={{
          background:
            "linear-gradient(to right, var(--color-surface) 0%, var(--color-surface) 52%, rgba(255,255,255,0.78) 64%, rgba(255,255,255,0.35) 80%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-[40%] xl:block"
        style={{
          background:
            "linear-gradient(to right, var(--color-surface) 0%, var(--color-surface) 48%, rgba(255,255,255,0.7) 62%, rgba(255,255,255,0.3) 78%, transparent 100%)",
        }}
      />
    </div>
  );
}
