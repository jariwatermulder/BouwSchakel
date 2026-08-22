"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { opslaanMatchingInstellingen, type MatchingState } from "../actions";
import type { MatchingConfig } from "@/server/matching/settings";

const initial: MatchingState = {};

const gewichten: { name: string; label: string }[] = [
  { name: "gewichtVakgebied", label: "Vakgebied" },
  { name: "gewichtBeschikbaarheid", label: "Beschikbaarheid" },
  { name: "gewichtSpecialisatie", label: "Specialisatie" },
  { name: "gewichtLocatie", label: "Locatie" },
  { name: "gewichtTarief", label: "Tarief" },
  { name: "gewichtErvaring", label: "Ervaring" },
  { name: "gewichtCertificaten", label: "Certificaten" },
  { name: "gewichtBetrouwbaarheid", label: "Betrouwbaarheid" },
];

export function MatchingForm({ config }: { config: MatchingConfig }) {
  const [state, formAction, pending] = useActionState(
    opslaanMatchingInstellingen,
    initial,
  );
  const w = config.weights;
  const defaults: Record<string, number> = {
    gewichtVakgebied: w.vakgebied,
    gewichtBeschikbaarheid: w.beschikbaarheid,
    gewichtSpecialisatie: w.specialisatie,
    gewichtLocatie: w.locatie,
    gewichtTarief: w.tarief,
    gewichtErvaring: w.ervaring,
    gewichtCertificaten: w.certificaten,
    gewichtBetrouwbaarheid: w.betrouwbaarheid,
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gewichten.map((g) => (
          <div key={g.name}>
            <Label htmlFor={g.name}>{g.label} (%)</Label>
            <Input
              id={g.name}
              name={g.name}
              type="number"
              min={0}
              max={100}
              defaultValue={defaults[g.name]}
            />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="minMatchScore">Minimale matchscore (%)</Label>
          <Input
            id="minMatchScore"
            name="minMatchScore"
            type="number"
            min={0}
            max={100}
            defaultValue={config.minMatchScore}
          />
        </div>
        <div>
          <Label htmlFor="maxAfstandKm">Maximale afstand (km)</Label>
          <Input
            id="maxAfstandKm"
            name="maxAfstandKm"
            type="number"
            min={1}
            max={1000}
            defaultValue={config.maxAfstandKm}
          />
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-emerald-700">Instellingen opgeslagen.</p>
      ) : null}

      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Bezig…" : "Opslaan"}
      </Button>
    </form>
  );
}
