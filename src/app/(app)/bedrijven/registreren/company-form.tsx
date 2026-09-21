"use client";

import { useActionState } from "react";
import type { Company } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KvkVeld } from "@/components/kvk-veld";
import { saveCompany, type CompanyFormState, type CompanyVeld } from "./actions";

const initial: CompanyFormState = {};

export function CompanyForm({
  company,
  onboarding,
  next,
}: {
  company: Company;
  onboarding: boolean;
  next?: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveCompany, initial);
  // Na een fout zet React de velden terug; de ingevulde waarden komen dan uit de state.
  const w = (veld: CompanyVeld, huidig: string | null | undefined) => state.waarden?.[veld] ?? huidig ?? "";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="onboarding" value={onboarding ? "1" : "0"} />
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="naam">Bedrijfsnaam</Label>
          <Input id="naam" name="naam" defaultValue={w("naam", company.naam)} required />
        </div>
        <KvkVeld defaultValue={w("kvkNummer", company.kvkNummer)} naamVeldId="naam" />
        <div>
          <Label htmlFor="contactpersoon">Contactpersoon (optioneel)</Label>
          <Input
            id="contactpersoon"
            name="contactpersoon"
            defaultValue={w("contactpersoon", company.contactpersoon)}
          />
        </div>
        <div>
          <Label htmlFor="telefoon">Telefoon (optioneel)</Label>
          <Input
            id="telefoon"
            name="telefoon"
            type="tel"
            defaultValue={w("telefoon", company.telefoon)}
          />
        </div>
        <div>
          <Label htmlFor="website">Website (optioneel)</Label>
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://..."
            defaultValue={w("website", company.website)}
          />
        </div>
        <div>
          <Label htmlFor="regio">Regio (optioneel)</Label>
          <Input
            id="regio"
            name="regio"
            defaultValue={w("regio", company.regio)}
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
            defaultValue={w("typeWerkzaamheden", company.typeWerkzaamheden)}
            placeholder="Bijv. installatie, schoonmaak, transport"
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
          defaultValue={w("omschrijving", company.omschrijving)}
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

      <Button type="submit" variant="brand" className="rounded-xl" disabled={pending}>
        {pending
          ? "Bezig…"
          : next
            ? "Opslaan en verdergaan"
            : onboarding
              ? "Opslaan en zzp'ers zoeken"
              : "Opslaan"}
      </Button>
    </form>
  );
}
