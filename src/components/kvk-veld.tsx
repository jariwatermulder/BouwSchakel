"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isGeldigKvkFormaat, kvkBlokkeert, kvkControleTekst, normaliseerKvk, type KvkControle } from "@/lib/kvk";
import { controleerKvkAction } from "@/app/(app)/kvk-controle/actions";

/**
 * KvK-nummerveld met ingebouwde controle: zodra er 8 cijfers staan (of bij
 * klikken op "Controleer") wordt het nummer bij het Handelsregister
 * opgezocht. Bij een treffer kan de gevonden bedrijfsnaam met één klik in het
 * naamveld (`naamVeldId`) worden gezet.
 */
export function KvkVeld({
  id = "kvkNummer",
  name = "kvkNummer",
  label = "KvK-nummer",
  defaultValue = "",
  required = true,
  naamVeldId,
  hint,
}: {
  id?: string;
  name?: string;
  label?: string;
  defaultValue?: string;
  required?: boolean;
  /** id van het bedrijfsnaam-invoerveld waarin de gevonden naam gezet kan worden. */
  naamVeldId?: string;
  hint?: string;
}) {
  const [waarde, setWaarde] = useState(defaultValue);
  const [resultaat, setResultaat] = useState<KvkControle | null>(null);
  const [bezig, startTransition] = useTransition();
  const laatstGecontroleerd = useRef<string | null>(null);
  const statusId = useId();

  const genormaliseerd = normaliseerKvk(waarde);
  const formaatOk = isGeldigKvkFormaat(genormaliseerd);

  const controleer = (nummer: string) => {
    if (!isGeldigKvkFormaat(nummer) || laatstGecontroleerd.current === nummer) return;
    laatstGecontroleerd.current = nummer;
    startTransition(async () => {
      try {
        setResultaat(await controleerKvkAction(nummer));
      } catch {
        setResultaat({ status: "niet_beschikbaar", kvkNummer: nummer });
      }
    });
  };

  // Automatisch controleren zodra er 8 cijfers staan (met korte pauze).
  useEffect(() => {
    if (!formaatOk) return;
    const t = window.setTimeout(() => controleer(genormaliseerd), 400);
    return () => window.clearTimeout(t);
  }, [genormaliseerd, formaatOk]);

  const naamOvernemen = () => {
    if (!naamVeldId || resultaat?.status !== "gevonden") return;
    const veld = document.getElementById(naamVeldId);
    if (veld instanceof HTMLInputElement) {
      veld.value = resultaat.naam;
      veld.dispatchEvent(new Event("input", { bubbles: true }));
      veld.focus();
    }
  };

  const toonResultaat = resultaat && resultaat.kvkNummer === genormaliseerd ? resultaat : null;
  const kleur =
    toonResultaat?.status === "gevonden"
      ? "text-emerald-700"
      : toonResultaat && (kvkBlokkeert(toonResultaat) || toonResultaat.status === "ongeldig")
        ? "text-red-600"
        : "text-foreground-muted";

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          name={name}
          inputMode="numeric"
          autoComplete="off"
          placeholder="8 cijfers"
          value={waarde}
          required={required}
          aria-describedby={statusId}
          aria-invalid={toonResultaat && kvkBlokkeert(toonResultaat) ? true : undefined}
          onChange={(e) => {
            setWaarde(e.target.value);
            if (resultaat && normaliseerKvk(e.target.value) !== resultaat.kvkNummer) setResultaat(null);
          }}
          onBlur={() => controleer(genormaliseerd)}
        />
        <button
          type="button"
          onClick={() => {
            laatstGecontroleerd.current = null;
            controleer(genormaliseerd);
          }}
          disabled={!formaatOk || bezig}
          className="border-border bg-surface text-foreground hover:bg-surface-muted h-11 shrink-0 rounded-lg border px-3 text-sm font-medium disabled:opacity-50"
        >
          {bezig ? "Bezig…" : "Controleer"}
        </button>
      </div>
      <p id={statusId} aria-live="polite" className={`mt-1 text-xs ${kleur}`}>
        {bezig
          ? "Controleren bij het Handelsregister…"
          : toonResultaat
            ? kvkControleTekst(toonResultaat)
            : waarde && !formaatOk
              ? "Een KvK-nummer bestaat uit 8 cijfers."
              : (hint ?? "We controleren het nummer bij het KvK Handelsregister.")}
      </p>
      {toonResultaat?.status === "gevonden" && naamVeldId ? (
        <button
          type="button"
          onClick={naamOvernemen}
          className="text-brand-600 mt-1 text-xs font-medium hover:underline"
        >
          Bedrijfsnaam ‘{toonResultaat.naam}’ overnemen
        </button>
      ) : null}
    </div>
  );
}
