"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "bs_install_dismissed";
const COOKIE_KEY = "bs_cookie_consent";

/** Het beforeinstallprompt-event is (nog) niet standaard getypeerd. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Uitnodiging om ZZP Connect als app te installeren.
 * - Android/Chrome/desktop: echte installatieknop via beforeinstallprompt.
 * - iOS Safari: korte instructie (daar bestaat geen installatieknop).
 * Verschijnt niet wanneer de app al is geïnstalleerd of eerder is weggeklikt,
 * en pas nadat de cookiemelding is afgehandeld (voorkomt gestapelde balken).
 */
export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    let dismissed = false;
    let cookieDone = false;
    try {
      dismissed = !!localStorage.getItem(DISMISS_KEY);
      cookieDone = !!localStorage.getItem(COOKIE_KEY);
    } catch {
      // localStorage niet beschikbaar: prompt niet tonen.
      return;
    }
    if (dismissed) return;

    // Android/Chrome/desktop: vang het installatie-event op.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (cookieDone) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS toont geen event; laat de instructie zien als cookie is afgehandeld.
    // Client-only check na hydration; bewuste, eenmalige setState.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isIos() && cookieDone) setVisible(true);

    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // negeren
    }
  }, []);

  const install = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      dismiss();
      return;
    }
    // iOS: geen programmatische installatie; toon instructie.
    setIosHelp((v) => !v);
  }, [deferred, dismiss]);

  if (!visible) return null;

  return (
    <div className="border-border bg-surface fixed inset-x-0 bottom-0 z-40 border-t p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <Image
          src="/icon-192.png"
          alt="ZZP Connect"
          width={44}
          height={44}
          className="rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-semibold">
            Installeer ZZP Connect als app
          </p>
          {iosHelp ? (
            <p className="text-foreground-muted text-sm">
              Tik op de deelknop en kies{" "}
              <span className="font-medium">“Zet op beginscherm”</span>.
            </p>
          ) : (
            <p className="text-foreground-muted text-sm">
              Zet ZZP Connect op je beginscherm — snel en zonder appstore.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button onClick={install} variant="accent" size="sm">
            Installeren
          </Button>
          <Button
            onClick={dismiss}
            variant="ghost"
            size="sm"
            aria-label="Melding sluiten"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
}
