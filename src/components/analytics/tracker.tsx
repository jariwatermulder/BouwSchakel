"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  flush,
  leesUtm,
  sessionId,
  track,
  trackingToegestaan,
} from "@/lib/analytics/client";
import { isEventName, CLIENT_EVENTS } from "@/lib/analytics/events";

/**
 * Onzichtbare component in de root-layout: stuurt page_views bij elke
 * navigatie, start sessies en vangt klikken op elementen met `data-track`.
 *
 *   <a data-track="cta_clicked" data-track-label="hero-zoek" href="/vind-zzper">
 *
 * De admin-omgeving wordt niet gemeten (eigen verkeer vervuilt de cijfers).
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const vorige = useRef<string | null>(null);

  useEffect(() => {
    if (!trackingToegestaan()) return;
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    if (vorige.current === pathname) return;

    const { nieuw } = sessionId();
    const utm = leesUtm();
    const eersteVanSessie = nieuw || vorige.current === null;
    const referrer = eersteVanSessie && document.referrer ? document.referrer : null;

    if (nieuw) track("session_start", undefined, { referrer, utm });
    track("page_view", vorige.current ? { vorige: vorige.current } : undefined, {
      referrer,
      utm,
    });
    vorige.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!trackingToegestaan()) return;

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const naam = el.dataset.track;
      if (!isEventName(naam) || !CLIENT_EVENTS.includes(naam)) return;
      const href = el.getAttribute("href");
      track(naam, {
        label: el.dataset.trackLabel ?? el.textContent?.trim().slice(0, 80) ?? "",
        ...(href ? { href: href.slice(0, 200) } : {}),
      });
    };

    const inAdmin = () => location.pathname.startsWith("/admin");
    // Tabblad naar de achtergrond of gesloten: sessie-einde melden en alles
    // wat nog in de wachtrij staat direct versturen (sendBeacon overleeft de
    // navigatie).
    const onZichtbaarheid = () => {
      if (document.visibilityState === "hidden" && !inAdmin()) {
        track("session_end");
        flush(true);
      }
    };
    // pagehide vuurt ook bij een gewone navigatie, soms zonder dat de pagina
    // eerst "hidden" wordt: altijd de wachtrij legen.
    const onPagehide = () => flush(true);

    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("visibilitychange", onZichtbaarheid);
    window.addEventListener("pagehide", onPagehide);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", onZichtbaarheid);
      window.removeEventListener("pagehide", onPagehide);
    };
  }, []);

  return null;
}
