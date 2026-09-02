"use client";

import { useActionState, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { formatEuro } from "@/lib/utils";
import { createFactuurAction, type FactuurFormState } from "./actions";

export type FactuurContext = {
  voorstelNummer: string;
  afzender: {
    naam: string;
    adres: string;
    postcode: string;
    plaats: string;
    kvk: string;
    btwId: string;
    iban: string;
    email: string;
  };
  assignments: {
    id: string;
    jobTitel: string;
    tariefEuro: number | null;
    bedrijf: string;
    bedrijfKvk: string;
  }[];
};

type Regel = { omschrijving: string; aantal: string; tarief: string };

const initial: FactuurFormState = {};
const veld = "border-border bg-surface focus-visible:border-navy-500 h-11 w-full rounded-lg border px-3 text-sm";

function vandaag(): string {
  return new Date().toISOString().slice(0, 10);
}
function overDagen(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function FactuurForm({ context }: { context: FactuurContext }) {
  const [state, formAction, pending] = useActionState(
    createFactuurAction,
    initial,
  );

  const [assignmentId, setAssignmentId] = useState("");
  const [klantNaam, setKlantNaam] = useState("");
  const [klantKvk, setKlantKvk] = useState("");
  const [btw, setBtw] = useState("21");
  const [regels, setRegels] = useState<Regel[]>([
    { omschrijving: "", aantal: "1", tarief: "" },
  ]);

  function kiesOpdracht(id: string) {
    setAssignmentId(id);
    const a = context.assignments.find((x) => x.id === id);
    if (!a) return;
    setKlantNaam(a.bedrijf);
    setKlantKvk(a.bedrijfKvk);
    setRegels((r) => {
      const leeg = r.length === 1 && !r[0]!.omschrijving && !r[0]!.tarief;
      const nieuw: Regel = {
        omschrijving: a.jobTitel,
        aantal: "1",
        tarief: a.tariefEuro != null ? String(a.tariefEuro) : "",
      };
      return leeg ? [nieuw] : [...r, nieuw];
    });
  }

  function updateRegel(i: number, patch: Partial<Regel>) {
    setRegels((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  }
  function voegRegelToe() {
    setRegels((r) => [...r, { omschrijving: "", aantal: "1", tarief: "" }]);
  }
  function verwijderRegel(i: number) {
    setRegels((r) => (r.length === 1 ? r : r.filter((_, j) => j !== i)));
  }

  const { subtotaalCents, btwCents, totaalCents, linesJson } = useMemo(() => {
    const geldig = regels
      .filter((r) => r.omschrijving.trim().length > 0)
      .map((r) => ({
        omschrijving: r.omschrijving.trim(),
        aantal: Number(r.aantal) || 0,
        tarief: Number(r.tarief) || 0,
      }));
    const sub = geldig.reduce(
      (s, r) => s + Math.round(r.aantal * r.tarief * 100),
      0,
    );
    const pct = Number(btw) || 0;
    const btwC = Math.round((sub * pct) / 100);
    return {
      subtotaalCents: sub,
      btwCents: btwC,
      totaalCents: sub + btwC,
      linesJson: JSON.stringify(geldig),
    };
  }, [regels, btw]);

  const a = context.afzender;

  return (
    <form action={formAction} className="space-y-8">
      {/* Opdracht koppelen */}
      {context.assignments.length > 0 ? (
        <div>
          <Label htmlFor="assignmentKeuze">Koppel aan een opdracht (optioneel)</Label>
          <select
            id="assignmentKeuze"
            className={veld}
            value={assignmentId}
            onChange={(e) => kiesOpdracht(e.target.value)}
          >
            <option value="">Geen — vrije factuur</option>
            {context.assignments.map((o) => (
              <option key={o.id} value={o.id}>
                {o.jobTitel} — {o.bedrijf}
              </option>
            ))}
          </select>
          <p className="text-foreground-muted mt-1 text-xs">
            Vult de klant en een regel automatisch in. Je kunt alles nog aanpassen.
          </p>
        </div>
      ) : null}
      <input type="hidden" name="assignmentId" value={assignmentId} />

      {/* Kop: nummer + datums */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="factuurnummer">Factuurnummer</Label>
          <Input id="factuurnummer" name="factuurnummer" defaultValue={context.voorstelNummer} required />
        </div>
        <div>
          <Label htmlFor="factuurdatum">Factuurdatum</Label>
          <Input id="factuurdatum" name="factuurdatum" type="date" defaultValue={vandaag()} required />
        </div>
        <div>
          <Label htmlFor="vervaldatum">Vervaldatum</Label>
          <Input id="vervaldatum" name="vervaldatum" type="date" defaultValue={overDagen(14)} />
        </div>
      </div>

      {/* Afzender + klant */}
      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Jouw gegevens</legend>
          <div>
            <Label htmlFor="afzenderNaam">Naam / bedrijf</Label>
            <Input id="afzenderNaam" name="afzenderNaam" defaultValue={a.naam} required />
          </div>
          <div>
            <Label htmlFor="afzenderAdres">Adres</Label>
            <Input id="afzenderAdres" name="afzenderAdres" defaultValue={a.adres} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="afzenderPostcode">Postcode</Label>
              <Input id="afzenderPostcode" name="afzenderPostcode" defaultValue={a.postcode} />
            </div>
            <div>
              <Label htmlFor="afzenderPlaats">Plaats</Label>
              <Input id="afzenderPlaats" name="afzenderPlaats" defaultValue={a.plaats} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="afzenderKvk">KvK-nummer</Label>
              <Input id="afzenderKvk" name="afzenderKvk" defaultValue={a.kvk} />
            </div>
            <div>
              <Label htmlFor="afzenderBtwId">Btw-id</Label>
              <Input id="afzenderBtwId" name="afzenderBtwId" defaultValue={a.btwId} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="afzenderIban">IBAN</Label>
              <Input id="afzenderIban" name="afzenderIban" defaultValue={a.iban} />
            </div>
            <div>
              <Label htmlFor="afzenderEmail">E-mail</Label>
              <Input id="afzenderEmail" name="afzenderEmail" defaultValue={a.email} />
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Klantgegevens</legend>
          <div>
            <Label htmlFor="klantNaam">Naam / bedrijf</Label>
            <Input id="klantNaam" name="klantNaam" value={klantNaam} onChange={(e) => setKlantNaam(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="klantAdres">Adres</Label>
            <Input id="klantAdres" name="klantAdres" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="klantPostcode">Postcode</Label>
              <Input id="klantPostcode" name="klantPostcode" />
            </div>
            <div>
              <Label htmlFor="klantPlaats">Plaats</Label>
              <Input id="klantPlaats" name="klantPlaats" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="klantKvk">KvK-nummer</Label>
              <Input id="klantKvk" name="klantKvk" value={klantKvk} onChange={(e) => setKlantKvk(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="klantEmail">E-mail</Label>
              <Input id="klantEmail" name="klantEmail" type="email" />
            </div>
          </div>
        </fieldset>
      </div>

      {/* Regels */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Regels</h2>
          <Button type="button" variant="outline" size="sm" onClick={voegRegelToe}>
            + Regel
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          {regels.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                className={`${veld} col-span-6`}
                placeholder="Omschrijving"
                value={r.omschrijving}
                onChange={(e) => updateRegel(i, { omschrijving: e.target.value })}
              />
              <input
                className={`${veld} col-span-2`}
                type="number"
                min="0"
                step="0.25"
                placeholder="Aantal"
                value={r.aantal}
                onChange={(e) => updateRegel(i, { aantal: e.target.value })}
              />
              <input
                className={`${veld} col-span-3`}
                type="number"
                min="0"
                step="0.01"
                placeholder="Tarief €"
                value={r.tarief}
                onChange={(e) => updateRegel(i, { tarief: e.target.value })}
              />
              <button
                type="button"
                onClick={() => verwijderRegel(i)}
                aria-label="Regel verwijderen"
                className="text-foreground-muted hover:text-red-600 col-span-1 flex items-center justify-center rounded-lg text-lg"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Btw + totalen */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="btwPercentage">Btw-tarief</Label>
          <select
            id="btwPercentage"
            name="btwPercentage"
            className={veld}
            value={btw}
            onChange={(e) => setBtw(e.target.value)}
          >
            <option value="21">21% (standaard)</option>
            <option value="9">9% (verlaagd)</option>
            <option value="0">0% (bijv. KOR / verlegd)</option>
          </select>
          <div className="mt-4">
            <Label htmlFor="opmerking">Opmerking (optioneel)</Label>
            <textarea
              id="opmerking"
              name="opmerking"
              rows={2}
              maxLength={1000}
              className="border-border bg-surface focus-visible:border-navy-500 w-full rounded-lg border p-3 text-sm"
            />
          </div>
        </div>
        <div className="border-border bg-surface-muted rounded-[var(--radius-card)] border p-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Subtotaal</dt>
              <dd className="font-medium tabular-nums">{formatEuro(subtotaalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Btw ({btw}%)</dt>
              <dd className="font-medium tabular-nums">{formatEuro(btwCents)}</dd>
            </div>
            <div className="border-border mt-2 flex justify-between border-t pt-2">
              <dt className="font-semibold">Totaal</dt>
              <dd className="text-lg font-bold tabular-nums">{formatEuro(totaalCents)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <input type="hidden" name="linesJson" value={linesJson} />

      {state.error ? <FormAlert>{state.error}</FormAlert> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="accent" size="lg" disabled={pending}>
          {pending ? "Bezig…" : "Factuur opslaan"}
        </Button>
        <p className="text-foreground-muted text-xs">
          Hulpmiddel — controleer zelf de fiscale juistheid.
        </p>
      </div>
    </form>
  );
}
