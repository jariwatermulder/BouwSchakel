"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

type Doelgroep = "opdrachtgever" | "zzper";

type Stap = { img: string; alt: string; titel: string; tekst: string };

const SETS: Record<
  Doelgroep,
  {
    label: string;
    stappen: Stap[];
    cta: { label: string; href: string };
    voordelen?: string[];
  }
> = {
  opdrachtgever: {
    label: "Voor opdrachtgevers",
    stappen: [
      {
        img: "/images/zo-werkt/og-1.png",
        alt: "Zoek op vakgebied en plaats in de ZZP Schakel-app.",
        titel: "Zoek op vak en regio",
        tekst: "Kies een vakgebied en je plaats. Zoeken kan zonder account.",
      },
      {
        img: "/images/zo-werkt/og-2.png",
        alt: "Profielkaart van een vakman met vakgebied en werkgebied.",
        titel: "Bekijk profielen",
        tekst: "Zie wie er werkt in jouw buurt, met vakgebied en werkgebied.",
      },
      {
        img: "/images/zo-werkt/og-3.png",
        alt: "Rechtstreeks contact opnemen met een vakman via bericht.",
        titel: "Neem rechtstreeks contact op",
        tekst:
          "Bespreek zelf het werk, het tarief en de planning. Geen tussenlaag.",
      },
    ],
    cta: { label: "Vind een zzp’er", href: "/vind-zzper" },
  },
  zzper: {
    label: "Voor zzp’ers",
    stappen: [
      {
        img: "/images/zo-werkt/zzp-1.png",
        alt: "Een zzp’er maakt een profiel aan op ZZP Schakel.",
        titel: "Maak gratis je profiel",
        tekst:
          "Laat zien wie je bent, wat je doet en waar je werkt. Binnen een paar minuten sta je online.",
      },
      {
        img: "/images/zo-werkt/zzp-2.png",
        alt: "Een zzp’er wordt op de kaart gevonden in zijn regio.",
        titel: "Word gevonden in jouw regio",
        tekst:
          "Opdrachtgevers zoeken op vakgebied en regio. Zo kom jij in beeld bij de juiste klussen.",
      },
      {
        img: "/images/zo-werkt/zzp-3.png",
        alt: "Een zzp’er ontvangt rechtstreeks een aanvraag van een opdrachtgever.",
        titel: "Kom direct in contact",
        tekst:
          "Ontvang berichten van opdrachtgevers en bespreek zelf de klus, het tarief en de planning. Zonder tussenlaag.",
      },
    ],
    cta: { label: "Maak gratis je profiel", href: "/registreren?rol=zzp" },
    voordelen: ["Gratis", "Binnen enkele minuten", "Geen tussenpersonen"],
  },
};

const VOLGORDE: Doelgroep[] = ["opdrachtgever", "zzper"];

function ToggleIcon({ groep }: { groep: Doelgroep }) {
  if (groep === "opdrachtgever") {
    // Gebouw / opdrachtgever
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
        <path
          d="M4 21V9l8-5 8 5v12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 21v-6h6v6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  // Persoon / zzp'er
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <circle
        cx="12"
        cy="8"
        r="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 20a7 7 0 0 1 14 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ZoWerktHet() {
  const [actief, setActief] = useState<Doelgroep>("zzper");
  const baseId = useId();
  const tabRefs = useRef<Record<Doelgroep, HTMLButtonElement | null>>({
    opdrachtgever: null,
    zzper: null,
  });

  const set = SETS[actief];

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next: Doelgroep =
      actief === "opdrachtgever" ? "zzper" : "opdrachtgever";
    setActief(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="bg-brand-50 py-14 md:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Zo werkt het</span>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">
            Twee manieren, één platform
          </h2>
          <p className="text-foreground-muted mt-2">
            Of je nu op zoek bent naar een vakman of zelf zzp’er bent — ZZP
            Schakel brengt jullie direct met elkaar in contact.
          </p>
        </div>

        {/* Toggle */}
        <div
          role="tablist"
          aria-label="Kies je doelgroep"
          onKeyDown={onKeyDown}
          className="border-border bg-surface mx-auto mt-8 flex w-full max-w-md items-center gap-1 rounded-full border p-1 sm:w-auto"
        >
          {VOLGORDE.map((groep) => {
            const isActief = groep === actief;
            return (
              <button
                key={groep}
                ref={(el) => {
                  tabRefs.current[groep] = el;
                }}
                role="tab"
                type="button"
                id={`${baseId}-tab-${groep}`}
                aria-selected={isActief}
                aria-controls={`${baseId}-panel`}
                tabIndex={isActief ? 0 : -1}
                onClick={() => setActief(groep)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:flex-initial sm:px-6 sm:whitespace-nowrap ${
                  isActief
                    ? "bg-brand-500 text-white shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                <ToggleIcon groep={groep} />
                {SETS[groep].label}
              </button>
            );
          })}
        </div>

        {/* Stappen */}
        <div
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${actief}`}
        >
          <ol
            key={actief}
            className="zw-swap mx-auto mt-10 grid max-w-5xl gap-8 sm:grid-cols-3 sm:gap-6"
          >
            {set.stappen.map((stap, i) => (
              <li
                key={stap.titel}
                className="flex flex-col items-center text-center"
              >
                <div className="bg-surface border-border/60 shadow-soft rounded-2xl border p-2.5">
                  <Image
                    src={stap.img}
                    alt={stap.alt}
                    width={640}
                    height={640}
                    sizes="(min-width: 640px) 220px, 60vw"
                    className="h-auto w-40 rounded-xl md:w-48"
                  />
                </div>
                <p className="text-brand-700 mt-5 text-sm font-semibold">
                  Stap {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{stap.titel}</h3>
                <p className="text-foreground-muted mx-auto mt-2 max-w-xs text-sm leading-relaxed">
                  {stap.tekst}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA + voordelen */}
        <div className="zw-swap mt-10 flex flex-col items-center" key={`${actief}-cta`}>
          <ButtonLink
            href={set.cta.href}
            variant="brand"
            size="lg"
            className="w-full max-w-sm justify-center rounded-xl sm:w-auto sm:px-10"
          >
            {set.cta.label}
          </ButtonLink>
          {set.voordelen ? (
            <ul className="text-foreground-muted mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
              {set.voordelen.map((v) => (
                <li key={v} className="inline-flex items-center gap-1.5">
                  <span className="text-brand-600" aria-hidden>
                    ✓
                  </span>
                  {v}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
