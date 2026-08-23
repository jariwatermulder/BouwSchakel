"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ChatBericht } from "@/lib/chat";
import { haalNieuweBerichten, stuurBericht } from "@/app/(app)/message-actions";

const POLL_MS = 4000;

function klok(iso: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function dagLabel(iso: string): string {
  const d = new Date(iso);
  const vandaag = new Date();
  const gisteren = new Date();
  gisteren.setDate(vandaag.getDate() - 1);
  const zelfdeDag = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (zelfdeDag(d, vandaag)) return "Vandaag";
  if (zelfdeDag(d, gisteren)) return "Gisteren";
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

function dagSleutel(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function initiaal(naam: string): string {
  return naam.trim().charAt(0).toUpperCase() || "?";
}

export function ConversationView({
  conversationId,
  currentUserId,
  tegenpartij,
  jobTitel,
  skillNaam,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  tegenpartij: string;
  jobTitel: string;
  skillNaam: string;
  initialMessages: ChatBericht[];
}) {
  const [berichten, setBerichten] = useState<ChatBericht[]>(initialMessages);
  const [tekst, setTekst] = useState("");
  const [bezig, setBezig] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const berichtenRef = useRef<ChatBericht[]>(initialMessages);

  const voegToe = useCallback((nieuwe: ChatBericht[]) => {
    if (nieuwe.length === 0) return;
    setBerichten((huidig) => {
      const bekend = new Set(huidig.map((m) => m.id));
      const extra = nieuwe.filter((m) => !bekend.has(m.id));
      if (extra.length === 0) return huidig;
      return [...huidig, ...extra].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
    });
  }, []);

  // Live pollen op nieuwe berichten van de tegenpartij.
  useEffect(() => {
    let actief = true;
    const poll = async () => {
      if (document.hidden) return;
      const laatste = berichtenRef.current.at(-1)?.createdAt;
      try {
        const nieuwe = await haalNieuweBerichten(conversationId, laatste);
        if (actief) voegToe(nieuwe);
      } catch {
        // Netwerkfout: volgende tik proberen we opnieuw.
      }
    };
    const interval = setInterval(poll, POLL_MS);
    poll();
    return () => {
      actief = false;
      clearInterval(interval);
    };
  }, [conversationId, voegToe]);

  // Houd de referentie actueel en scroll mee naar het nieuwste bericht.
  useEffect(() => {
    berichtenRef.current = berichten;
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [berichten]);

  const verstuur = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const inhoud = tekst.trim();
      if (!inhoud || bezig) return;
      setBezig(true);
      setTekst("");
      try {
        const opgeslagen = await stuurBericht(conversationId, inhoud);
        if (opgeslagen) voegToe([opgeslagen]);
        else setTekst(inhoud);
      } catch {
        setTekst(inhoud);
      } finally {
        setBezig(false);
      }
    },
    [tekst, bezig, conversationId, voegToe],
  );

  return (
    <div className="border-border bg-surface flex h-[72vh] flex-col overflow-hidden rounded-2xl border shadow-sm">
      {/* Chatkop */}
      <div className="border-border bg-ink flex items-center gap-3 border-b px-4 py-3 text-white">
        <span className="bg-accent-500 text-ink flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold">
          {initiaal(tegenpartij)}
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold">{tegenpartij}</p>
          <p className="text-navy-200 truncate text-xs">
            {jobTitel} · {skillNaam}
          </p>
        </div>
      </div>

      {/* Berichten */}
      <div ref={scrollRef} className="bs-chat-bg flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {berichten.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="bg-surface border-border text-accent-500 mb-3 flex h-14 w-14 items-center justify-center rounded-full border text-2xl shadow-sm">
              💬
            </span>
            <p className="text-foreground text-sm font-medium">
              Nog geen berichten
            </p>
            <p className="text-foreground-muted mt-1 max-w-xs text-sm">
              Stuur het eerste bericht om het gesprek te starten.
            </p>
          </div>
        ) : (
          berichten.map((m, i) => {
            const vanMij = m.senderUserId === currentUserId;
            const vorige = berichten[i - 1];
            const volgende = berichten[i + 1];
            const nieuweDag =
              !vorige || dagSleutel(vorige.createdAt) !== dagSleutel(m.createdAt);
            const eersteVanGroep =
              !vorige ||
              vorige.senderUserId !== m.senderUserId ||
              nieuweDag;
            const laatsteVanGroep =
              !volgende ||
              volgende.senderUserId !== m.senderUserId ||
              dagSleutel(volgende.createdAt) !== dagSleutel(m.createdAt);

            return (
              <div key={m.id}>
                {nieuweDag ? (
                  <div className="my-3 flex justify-center">
                    <span className="bg-surface text-foreground-muted border-border rounded-full border px-3 py-1 text-xs font-medium shadow-sm">
                      {dagLabel(m.createdAt)}
                    </span>
                  </div>
                ) : null}

                <div
                  className={cn(
                    "flex items-end gap-2",
                    eersteVanGroep ? "mt-2" : "mt-0.5",
                    vanMij ? "justify-end" : "justify-start",
                  )}
                >
                  {/* Avatar tegenpartij (alleen bij laatste van groep) */}
                  {!vanMij ? (
                    laatsteVanGroep ? (
                      <span className="bg-navy-700 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                        {initiaal(tegenpartij)}
                      </span>
                    ) : (
                      <span className="w-7 shrink-0" aria-hidden />
                    )
                  ) : null}

                  <div
                    className={cn(
                      "bs-msg-in max-w-[78%] px-3.5 py-2 text-sm shadow-sm",
                      vanMij
                        ? "bg-navy-800 rounded-2xl text-white"
                        : "bg-surface border-border rounded-2xl border",
                      // "staartje" op de laatste bubbel van een groep
                      laatsteVanGroep &&
                        (vanMij ? "rounded-br-md" : "rounded-bl-md"),
                    )}
                  >
                    <p className="break-words whitespace-pre-line">{m.body}</p>
                    {laatsteVanGroep ? (
                      <p
                        className={cn(
                          "mt-1 text-right text-[10px]",
                          vanMij ? "text-navy-200" : "text-foreground-muted",
                        )}
                      >
                        {klok(m.createdAt)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invoer */}
      <form
        onSubmit={verstuur}
        className="border-border bg-surface flex items-center gap-2 border-t p-3"
      >
        <input
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          maxLength={4000}
          placeholder="Typ een bericht…"
          aria-label="Bericht"
          className="border-border bg-surface-muted focus-visible:border-navy-500 focus-visible:bg-surface h-11 flex-1 rounded-full border px-4 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={bezig || !tekst.trim()}
          aria-label="Versturen"
          className="bg-accent-500 text-ink hover:bg-accent-400 flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
            <path d="M2.3 2.3a1 1 0 011.05-.23l14 5.5a1 1 0 010 1.86l-14 5.5A1 1 0 012 13.9l1.4-3.9L11 9 3.4 8 2 4.1a1 1 0 01.3-1.8z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
