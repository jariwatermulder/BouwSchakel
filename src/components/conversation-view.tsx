"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatBericht } from "@/lib/chat";
import { haalNieuweBerichten, stuurBericht } from "@/app/(app)/message-actions";

const POLL_MS = 4000;

function tijd(iso: string): string {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
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
  const bodemRef = useRef<HTMLDivElement>(null);
  // Actuele referentie zodat de poller altijd de laatste stand kent.
  const berichtenRef = useRef<ChatBericht[]>(initialMessages);

  // Voeg berichten toe zonder duplicaten (op id).
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

  useEffect(() => {
    berichtenRef.current = berichten;
    // Scroll mee naar het nieuwste bericht.
    bodemRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
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
        if (opgeslagen) {
          voegToe([opgeslagen]);
        } else {
          setTekst(inhoud); // niet verstuurd: tekst teruggeven
        }
      } catch {
        setTekst(inhoud);
      } finally {
        setBezig(false);
      }
    },
    [tekst, bezig, conversationId, voegToe],
  );

  return (
    <div>
      <Card>
        <CardTitle>{tegenpartij}</CardTitle>
        <p className="text-foreground-muted text-sm">
          Over: {jobTitel} · {skillNaam}
        </p>
      </Card>

      <div className="mt-4 space-y-3">
        {berichten.length === 0 ? (
          <p className="text-foreground-muted text-sm">
            Nog geen berichten. Stuur het eerste bericht.
          </p>
        ) : (
          berichten.map((m) => {
            const vanMij = m.senderUserId === currentUserId;
            return (
              <div
                key={m.id}
                className={cn("flex", vanMij ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    vanMij
                      ? "bg-navy-800 text-white"
                      : "border-border bg-surface border",
                  )}
                >
                  <p className="whitespace-pre-line">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      vanMij ? "text-navy-200" : "text-foreground-muted",
                    )}
                  >
                    {tijd(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bodemRef} />
      </div>

      <form
        onSubmit={verstuur}
        className="border-border mt-4 flex gap-2 border-t pt-4"
      >
        <input
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          required
          maxLength={4000}
          placeholder="Typ een bericht…"
          aria-label="Bericht"
          className="border-border bg-surface focus-visible:border-navy-500 h-11 flex-1 rounded-lg border px-3 text-sm"
        />
        <Button type="submit" variant="accent" disabled={bezig}>
          {bezig ? "Versturen…" : "Versturen"}
        </Button>
      </form>
    </div>
  );
}
