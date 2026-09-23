"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { verstuurContact, type ContactState } from "./actions";

const initial: ContactState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(verstuurContact, initial);

  if (state.ok) {
    return (
      <p className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
        Bedankt voor je bericht. We reageren zo snel mogelijk op het opgegeven
        e-mailadres, meestal binnen twee werkdagen.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="naam">Naam</Label>
          <Input id="naam" name="naam" autoComplete="name" required />
        </div>
        <div>
          <Label htmlFor="email">E-mailadres</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
      </div>
      <div>
        <Label htmlFor="onderwerp">Onderwerp</Label>
        <Input id="onderwerp" name="onderwerp" required />
      </div>
      <div>
        <Label htmlFor="bericht">Bericht</Label>
        <textarea
          id="bericht"
          name="bericht"
          rows={6}
          required
          minLength={10}
          maxLength={4000}
          className="border-border bg-surface focus-visible:border-brand-500 w-full rounded-lg border p-3 text-sm outline-none"
        />
      </div>
      {/* Honeypot tegen spam-bots; verborgen voor mensen en schermlezers. */}
      <div aria-hidden className="hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="brand" disabled={pending} className="rounded-xl">
        {pending ? "Bezig…" : "Verstuur bericht"}
      </Button>
    </form>
  );
}
