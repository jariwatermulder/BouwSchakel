"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { opslaanPrijzen, type MatchingState } from "../actions";
import type { PricingConfig } from "@/server/payments/pricing";

const initial: MatchingState = {};

export function PricingForm({ config }: { config: PricingConfig }) {
  const [state, formAction, pending] = useActionState(opslaanPrijzen, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="feeModel">Fee-model</Label>
        <select
          id="feeModel"
          name="feeModel"
          defaultValue={config.feeModel}
          className="border-border bg-surface h-11 w-full rounded-lg border px-3 text-sm"
        >
          <option value="PER_UUR">Succesfee per gewerkt uur</option>
          <option value="VAST">Vaste bemiddelingsfee per opdracht</option>
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="succesfeePerUurEuro">Succesfee per uur (€)</Label>
          <Input
            id="succesfeePerUurEuro"
            name="succesfeePerUurEuro"
            type="number"
            min={0}
            step="0.5"
            defaultValue={config.succesfeePerUurCents / 100}
          />
        </div>
        <div>
          <Label htmlFor="vasteBemiddelingsfeeEuro">
            Vaste bemiddelingsfee (€)
          </Label>
          <Input
            id="vasteBemiddelingsfeeEuro"
            name="vasteBemiddelingsfeeEuro"
            type="number"
            min={0}
            step="0.5"
            defaultValue={config.vasteBemiddelingsfeeCents / 100}
          />
        </div>
        <div>
          <Label htmlFor="proMaandEuro">ZZP Connect Pro (€/maand)</Label>
          <Input
            id="proMaandEuro"
            name="proMaandEuro"
            type="number"
            min={0}
            step="1"
            defaultValue={config.proMaandCents / 100}
          />
        </div>
        <div>
          <Label htmlFor="btwPercentage">Btw-percentage (%)</Label>
          <Input
            id="btwPercentage"
            name="btwPercentage"
            type="number"
            min={0}
            max={100}
            defaultValue={config.btwPercentage}
          />
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-emerald-700">Prijzen opgeslagen.</p>
      ) : null}

      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Bezig…" : "Opslaan"}
      </Button>
    </form>
  );
}
