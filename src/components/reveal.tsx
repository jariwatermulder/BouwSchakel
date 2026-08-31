"use client";

import { useEffect, useRef } from "react";

/**
 * Onthult zijn inhoud met een zachte fade-up zodra het element in beeld komt.
 * Valt veilig terug: zonder IntersectionObserver of bij prefers-reduced-motion
 * wordt de inhoud direct getoond (zie globals.css).
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("bs-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("bs-in");
            io.unobserve(el);
          }
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    // Vangnet: altijd tonen, ook als de observer onverhoopt niet vuurt.
    const t = window.setTimeout(() => el.classList.add("bs-in"), 1500);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`bs-reveal ${className ?? ""}`}
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
