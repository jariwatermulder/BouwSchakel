"use client";

import * as React from "react";
import { Icon } from "@/components/home/pictos";

/**
 * Speelse kennis-elementen: een roulerend 'Wist je dat?'-weetje en een
 * mini-quiz. Alle inhoud is algemeen en feitelijk (geen verzonnen cijfers);
 * bij het weetje staat een korte disclaimer — het is geen juridisch of
 * financieel advies.
 */

type Categorie = "werk" | "hypotheek";

const CAT_STYLE: Record<Categorie, { label: string; kleur: string }> = {
  werk: { label: "Werk & zzp", kleur: "#2563eb" },
  hypotheek: { label: "Hypotheek", kleur: "#0d9488" },
};

const WEETJES: { t: string; c: Categorie }[] = [
  { t: "ZZP staat voor ‘zelfstandige zonder personeel’.", c: "werk" },
  {
    t: "Als zzp’er ben je zelf verantwoordelijk voor je administratie, verzekeringen en pensioen.",
    c: "werk",
  },
  {
    t: "Veel zzp’ers zetten een deel van elke factuur apart voor de belasting, zodat de aanslag geen verrassing is.",
    c: "werk",
  },
  {
    t: "De btw draag je als ondernemer meestal per kwartaal af aan de Belastingdienst.",
    c: "werk",
  },
  {
    t: "Met de kleineondernemersregeling (KOR) kun je onder voorwaarden vrijgesteld zijn van btw.",
    c: "werk",
  },
  {
    t: "Een volledig profiel met certificaten en een goede omschrijving vergroot je kans op een match.",
    c: "werk",
  },
  {
    t: "Een modelovereenkomst helpt om de afspraken tussen opdrachtgever en zzp’er duidelijk vast te leggen.",
    c: "werk",
  },
  {
    t: "Ook als zzp’er kun je een hypotheek krijgen; geldverstrekkers kijken vaak naar je inkomen over de afgelopen jaren.",
    c: "hypotheek",
  },
  {
    t: "Sommige geldverstrekkers accepteren zzp’ers al na één jaar ondernemen, afhankelijk van je cijfers.",
    c: "hypotheek",
  },
  {
    t: "Een stabiele of stijgende winst over meerdere jaren vergroot vaak je leenruimte.",
    c: "hypotheek",
  },
  {
    t: "De hypotheekrente voor je eigen woning is onder voorwaarden fiscaal aftrekbaar.",
    c: "hypotheek",
  },
  {
    t: "Bij een annuïteitenhypotheek blijft je bruto maandlast (bij gelijkblijvende rente) het hele looptijd gelijk.",
    c: "hypotheek",
  },
  {
    t: "Een onafhankelijk hypotheekadviseur kan je zzp-situatie bij meerdere geldverstrekkers doorrekenen.",
    c: "hypotheek",
  },
];

type Vraag = {
  vraag: string;
  opties: string[];
  goed: number;
  uitleg: string;
};

const VRAGEN: Vraag[] = [
  {
    vraag: "Waar staat de afkorting ZZP voor?",
    opties: [
      "Zelfstandige zonder personeel",
      "Zakelijk zelfstandig persoon",
      "Zelfstandige zakelijke partij",
    ],
    goed: 0,
    uitleg: "ZZP betekent ‘zelfstandige zonder personeel’.",
  },
  {
    vraag: "Hoe vaak dragen de meeste ondernemers hun btw af?",
    opties: ["Per kwartaal", "Per week", "Nooit"],
    goed: 0,
    uitleg:
      "Meestal per kwartaal. Afhankelijk van je situatie kan het ook per maand of per jaar.",
  },
  {
    vraag: "Kan een zzp’er een hypotheek krijgen?",
    opties: ["Ja, dat kan", "Nee, nooit", "Alleen met personeel"],
    goed: 0,
    uitleg:
      "Ja. Geldverstrekkers kijken vaak naar je inkomen en cijfers over de afgelopen jaren.",
  },
  {
    vraag: "Wat betekent de afkorting KOR?",
    opties: [
      "Kleineondernemersregeling",
      "Kosten op rekening",
      "Klant-order-registratie",
    ],
    goed: 0,
    uitleg:
      "De kleineondernemersregeling: onder voorwaarden ben je vrijgesteld van btw.",
  },
  {
    vraag: "Wat legt een modelovereenkomst vast?",
    opties: [
      "Afspraken tussen opdrachtgever en zzp’er",
      "Je pensioenopbouw",
      "De hoogte van de hypotheekrente",
    ],
    goed: 0,
    uitleg:
      "De afspraken over de samenwerking tussen opdrachtgever en zelfstandige.",
  },
  {
    vraag: "Bij welke hypotheekvorm blijft de bruto maandlast bij gelijke rente gelijk?",
    opties: [
      "Annuïteitenhypotheek",
      "Aflossingsvrije hypotheek",
      "Er bestaat geen vaste maandlast",
    ],
    goed: 0,
    uitleg:
      "Bij een annuïteitenhypotheek is de bruto maandlast (bij gelijkblijvende rente) steeds gelijk.",
  },
];

/** Kies een nieuwe willekeurige index (na mount, om hydration-mismatch te voorkomen). */
function useRandomIndex(len: number) {
  const [i, setI] = React.useState(0);
  // Willekeurige start ná mount (voorkomt SSR/client hydration-mismatch).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setI(Math.floor(Math.random() * len));
  }, [len]);
  const volgende = React.useCallback(() => {
    setI((prev) => {
      if (len <= 1) return prev;
      let n = prev;
      while (n === prev) n = Math.floor(Math.random() * len);
      return n;
    });
  }, [len]);
  return [i, volgende] as const;
}

export function Weetje() {
  const [i, volgende] = useRandomIndex(WEETJES.length);
  const item = WEETJES[i]!;
  const stijl = CAT_STYLE[item.c];
  return (
    <div
      className="border-border bg-surface shadow-soft flex h-full flex-col rounded-[var(--radius-card)] border border-t-4 p-6"
      style={{ borderTopColor: stijl.kleur }}
    >
      <div className="flex items-center gap-2">
        <span className="bg-accent-500/10 text-accent-600 flex h-9 w-9 items-center justify-center rounded-xl">
          <Icon name="lightbulb" className="h-5 w-5" />
        </span>
        <span className="text-foreground font-semibold">Wist je dat?</span>
        <span
          className="ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ backgroundColor: `${stijl.kleur}1a`, color: stijl.kleur }}
        >
          {stijl.label}
        </span>
      </div>
      <p
        key={i}
        className="bs-msg-in text-foreground mt-4 flex-1 text-lg leading-relaxed font-medium"
      >
        {item.t}
      </p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={volgende}
          className="text-accent-600 hover:text-accent-500 inline-flex items-center gap-1.5 text-sm font-bold"
        >
          Nog een weetje
          <span aria-hidden>→</span>
        </button>
        <span className="text-foreground-muted text-xs">
          Algemene info, geen advies
        </span>
      </div>
    </div>
  );
}

export function MiniQuiz() {
  const [i, volgende] = useRandomIndex(VRAGEN.length);
  const [gekozen, setGekozen] = React.useState<number | null>(null);
  const vraag = VRAGEN[i]!;

  const volgendeVraag = React.useCallback(() => {
    setGekozen(null);
    volgende();
  }, [volgende]);

  const beantwoord = gekozen !== null;

  return (
    <div className="border-border bg-surface shadow-soft flex h-full flex-col rounded-[var(--radius-card)] border border-t-4 border-t-[#7c3aed] p-6">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7c3aed1a] text-[#7c3aed]">
          <Icon name="star" className="h-5 w-5" />
        </span>
        <span className="text-foreground font-semibold">Mini-quiz</span>
      </div>

      <p key={i} className="bs-msg-in text-foreground mt-4 font-semibold">
        {vraag.vraag}
      </p>

      <div className="mt-4 flex-1 space-y-2">
        {vraag.opties.map((optie, idx) => {
          const isGoed = idx === vraag.goed;
          const isGekozen = idx === gekozen;
          let stijl =
            "border-border bg-surface hover:border-navy-300 text-foreground";
          if (beantwoord && isGoed) {
            stijl = "border-emerald-300 bg-emerald-50 text-emerald-800";
          } else if (beantwoord && isGekozen && !isGoed) {
            stijl = "border-red-300 bg-red-50 text-red-800";
          } else if (beantwoord) {
            stijl = "border-border bg-surface text-foreground-muted";
          }
          return (
            <button
              key={optie}
              type="button"
              disabled={beantwoord}
              onClick={() => setGekozen(idx)}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-default ${stijl}`}
            >
              <span
                aria-hidden
                className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold"
              >
                {beantwoord && isGoed
                  ? "✓"
                  : beantwoord && isGekozen
                    ? "✕"
                    : String.fromCharCode(65 + idx)}
              </span>
              {optie}
            </button>
          );
        })}
      </div>

      {beantwoord ? (
        <div className="bs-msg-in mt-4">
          <p
            className={`text-sm font-bold ${
              gekozen === vraag.goed ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {gekozen === vraag.goed ? "Goed! 🎉" : "Net niet…"}
          </p>
          <p className="text-foreground-muted mt-1 text-sm">{vraag.uitleg}</p>
          <button
            type="button"
            onClick={volgendeVraag}
            className="text-accent-600 hover:text-accent-500 mt-3 inline-flex items-center gap-1.5 text-sm font-bold"
          >
            Volgende vraag
            <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Volledige, kleurrijke sectie met weetje + mini-quiz naast elkaar. */
export function KennisSectie() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Weetje />
      <MiniQuiz />
    </div>
  );
}
