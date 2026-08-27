"use client";

import { useEffect } from "react";

/**
 * Registreert de service worker zodat ZZP Connect als PWA installeerbaar is.
 * Draait alleen client-side en faalt stil wanneer service workers niet worden
 * ondersteund (bijv. oudere browsers).
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registratie is niet kritiek voor de werking van de app.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
