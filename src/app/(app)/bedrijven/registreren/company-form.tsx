"use client";

import { useActionState } from "react";
import type { Company } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { saveCompany, type CompanyFormState } from "./actions";

const initial: CompanyFormState = {};

export function CompanyForm({
  company,
  onboarding,
}: {
  company: Company;
  onboarding: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveCompany, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="onboarding" value={onboarding ? "1" : "0"} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="naam">Bedrijfsnaam</Label>
          <Input id="naam" name="naam" defaultValue={company.naam} required />
        </div>
        <div>
          <Label htmlFor="kvkNummer">KvK-nummer (optioneel)</Label>
          <Input
            id="kvkNummer"
            name="kvkNummer"
            inputMode="numeric"
            pattern="\d{8}"
            placeholder="8 cijfers"
            defaultValue={company.kvkNummer ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="contactpersoon">Contactpersoon (optioneel)</Label>
          <Input
            id="contactpersoon"
            name="contactpersoon"
            defaultValue={company.contactpersoon ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="telefoon">Telefoon (optioneel)</Label>
          <Input
            id="telefoon"
            name="telefoon"
            type="tel"
            defaultValue={company.telefoon ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="website">Website (optioneel)</Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://..."
            defaultValue={company.website ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="regio">Regio (optioneel)</Label>
          <Input
            id="regio"
            name="regio"
            defaultValue={company.regio ?? ""}
            placeholder="Bijv. Groningen"
          />
        </div>
        <div>
          <Label htmlFor="typeWerkzaamheden">
            Type werkzaamheden (optioneel)
          </Label>
          <Input
            id="typeWerkzaamheden"
            name="typeWerkzaamheden"
            defaultValue={company.typeWerkzaamheden ?? ""}
            placeholder="Bijv. renovatie, nieuwbouw"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="omschrijving">Bedrijfsomschrijving (optioneel)</Label>
        <textarea
          id="omschrijving"
          name="omschrijving"
          rows={4}
          maxLength={2000}
          defaultValue={company.omschrijving ?? ""}
          className="border-border bg-surface focus-visible:border-navy-500 w-full rounded-lg border p-3 text-sm"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-emerald-700">Bedrijfsprofiel opgeslagen.</p>
      ) : null}

      <Button type="submit" variant="accent" disabled={pending}>
        {pending
          ? "Bezig…"
          : onboarding
            ? "Opslaan en opdracht plaatsen"
            : "Opslaan"}
      </Button>
    </form>
  );
}
