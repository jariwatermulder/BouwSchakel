"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { dienKlachtIn, type KlachtState } from "./actions";

const initial: KlachtState = {};

export function KlachtForm() {
  const [state, formAction, pending] = useActionState(dienKlachtIn, initial);

  if (state.ok) {
    return (
      <p className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
        Bedankt. Je klacht is ontvangen; we behandelen deze zo snel mogelijk.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="naam">Naam</Label>
          <Input id="naam" name="naam" required />
        </div>
        <div>
          <Label htmlFor="email">E-mailadres</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>
      <div>
        <Label htmlFor="onderwerp">Onderwerp</Label>
        <Input id="onderwerp" name="onderwerp" required />
      </div>
      <div>
        <Label htmlFor="bericht">Je klacht</Label>
        <textarea
          id="bericht"
          name="bericht"
          rows={5}
          required
          maxLength={4000}
          className="border-border bg-surface focus-visible:border-navy-500 w-full rounded-lg border p-3 text-sm"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Bezig…" : "Klacht indienen"}
      </Button>
    </form>
  );
}
