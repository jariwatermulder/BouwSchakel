"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Toont eerlijk hoe vers de data is: de dashboards zijn niet realtime maar
 * worden elke minuut opnieuw geladen (server-cache van 60 s). Alleen de
 * activiteitenfeed ververst vaker (elke 10 s).
 */
export function LiveStatus({
  bijgewerkt,
  intervalMs = 60_000,
  label = "Elke minuut bijgewerkt",
}: {
  bijgewerkt: string;
  intervalMs?: number;
  label?: string;
}) {
  const router = useRouter();
  const [tijd, setTijd] = useState<string>("");

  useEffect(() => {
    // Tijd pas in de browser opmaken (tijdzone van de beheerder).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTijd(new Date(bijgewerkt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }));
  }, [bijgewerkt]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return (
    <p className="text-foreground-muted inline-flex items-center gap-2 text-xs" aria-live="polite">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-foreground font-semibold">Live</span>
      <span aria-hidden>·</span>
      <span>{label}</span>
      {tijd ? (
        <>
          <span aria-hidden>·</span>
          <span>Laatst bijgewerkt: {tijd}</span>
        </>
      ) : null}
    </p>
  );
}
