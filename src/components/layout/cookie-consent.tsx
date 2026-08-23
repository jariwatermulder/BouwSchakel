"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const KEY = "bs_cookie_consent";

/** Eenvoudige cookiemelding. Keuze wordt lokaal in de browser bewaard. */
export function CookieConsent() {
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    try {
      // Client-only check na hydration; voorkomt hydration-mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(KEY)) setZichtbaar(true);
    } catch {
      // localStorage niet beschikbaar: banner niet tonen.
    }
  }, []);

  if (!zichtbaar) return null;

  function accepteer() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // negeren
    }
    setZichtbaar(false);
  }

  return (
    <div className="border-border bg-surface fixed inset-x-0 bottom-0 z-50 border-t p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-foreground-muted text-sm">
          We gebruiken functionele cookies om het platform te laten werken. Lees
          ons{" "}
          <Link href="/cookies" className="text-navy-700 underline">
            cookiebeleid
          </Link>
          .
        </p>
        <Button onClick={accepteer} variant="accent" size="sm">
          Akkoord
        </Button>
      </div>
    </div>
  );
}
