"use client";

import * as React from "react";
import { Icon } from "@/components/home/pictos";

type Msg = { role: "user" | "assistant"; content: string };

const WELKOM =
  "Hoi! 👋 Ik ben de assistent van ZZP Connect. Vraag me gerust iets over het platform, zzp'en, of werk in het algemeen.";

const SUGGESTIES = [
  "Hoe werkt ZZP Connect?",
  "Wat kost het?",
  "Kan ik als zzp'er een hypotheek krijgen?",
];

export function AssistantWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [invoer, setInvoer] = React.useState("");
  const [bezig, setBezig] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  async function verstuur(tekst: string) {
    const vraag = tekst.trim();
    if (!vraag || bezig) return;
    setInvoer("");

    const nieuweGeschiedenis: Msg[] = [
      ...messages,
      { role: "user", content: vraag },
    ];
    // Voeg alvast een lege assistent-bubbel toe om in te vullen.
    setMessages([...nieuweGeschiedenis, { role: "assistant", content: "" }]);
    setBezig(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nieuweGeschiedenis.slice(-20) }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = (await res.json()) as { message?: string; error?: string };
        const bericht =
          data.message ??
          data.error ??
          "Sorry, er ging iets mis. Probeer het later opnieuw.";
        setMessages((m) => {
          const kopie = [...m];
          kopie[kopie.length - 1] = { role: "assistant", content: bericht };
          return kopie;
        });
        return;
      }

      if (!res.body) throw new Error("Geen antwoord-stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let antwoord = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        antwoord += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const kopie = [...m];
          kopie[kopie.length - 1] = { role: "assistant", content: antwoord };
          return kopie;
        });
      }
    } catch {
      setMessages((m) => {
        const kopie = [...m];
        kopie[kopie.length - 1] = {
          role: "assistant",
          content:
            "Sorry, er ging iets mis. Probeer het zo nog eens of neem contact op via /contact.",
        };
        return kopie;
      });
    } finally {
      setBezig(false);
    }
  }

  const toonWelkom = messages.length === 0;

  return (
    <>
      {/* Zwevende knop */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Sluit de assistent" : "Open de AI-assistent"}
        aria-expanded={open}
        className="from-accent-500 to-accent-400 text-ink fixed right-4 bottom-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br shadow-[0_10px_30px_-6px_rgba(245,158,11,0.6)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 md:right-6 md:bottom-6"
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            className="h-6 w-6"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <Icon name="chat" className="h-6 w-6" />
        )}
      </button>

      {/* Chatvenster */}
      {open ? (
        <div
          role="dialog"
          aria-label="AI-assistent"
          className="bs-msg-in border-border bg-surface shadow-elevated fixed right-4 bottom-20 z-50 flex h-[30rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[var(--radius-card)] border md:right-6 md:bottom-24"
        >
          {/* Kop */}
          <div className="bg-ink bs-hero-mesh flex items-center gap-3 px-4 py-3 text-white">
            <span className="from-accent-500 to-accent-400 text-ink flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black">
              ZC
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">ZZP-assistent</p>
              <p className="text-navy-200 flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Meestal binnen enkele seconden
              </p>
            </div>
          </div>

          {/* Berichten */}
          <div
            ref={scrollRef}
            className="bs-chat-bg flex-1 space-y-3 overflow-y-auto p-4"
          >
            {toonWelkom ? (
              <>
                <Bubbel rol="assistant">{WELKOM}</Bubbel>
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => verstuur(s)}
                      className="border-border bg-surface text-foreground hover:border-accent-500 hover:text-accent-600 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              messages.map((m, i) => (
                <Bubbel key={i} rol={m.role}>
                  {m.content ||
                    (bezig && i === messages.length - 1 ? (
                      <TypIndicator />
                    ) : (
                      ""
                    ))}
                </Bubbel>
              ))
            )}
          </div>

          {/* Invoer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void verstuur(invoer);
            }}
            className="border-border flex items-center gap-2 border-t p-3"
          >
            <input
              value={invoer}
              onChange={(e) => setInvoer(e.target.value)}
              placeholder="Stel je vraag…"
              aria-label="Je vraag"
              className="border-border focus-visible:border-navy-500 h-11 flex-1 rounded-full border px-4 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={bezig || !invoer.trim()}
              aria-label="Verstuur"
              className="bg-accent-500 text-ink flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform hover:-translate-y-0.5 disabled:opacity-40"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M4 12l16-8-6 16-3-6-7-2Z" />
              </svg>
            </button>
          </form>
          <p className="text-foreground-muted bg-surface px-3 pb-2 text-center text-[11px]">
            AI kan fouten maken — geen juridisch of financieel advies.
          </p>
        </div>
      ) : null}
    </>
  );
}

function Bubbel({
  rol,
  children,
}: {
  rol: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = rol === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`bs-msg-in max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-navy-800 rounded-br-sm text-white"
            : "border-border text-foreground rounded-bl-sm border bg-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function TypIndicator() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Aan het typen">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="bg-foreground-muted h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}
