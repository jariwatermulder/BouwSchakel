"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { reageerOpOpdracht, type ApplyState } from "./apply-actions";

const initial: ApplyState = {};

export function ApplyForm({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(
    reageerOpOpdracht,
    initial,
  );

  if (state.ok) {
    return (
      <p className="text-sm text-emerald-700">
        Je reactie is verstuurd. Het bedrijf neemt contact op via Berichten.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <div>
        <Label htmlFor="bericht">Bericht (optioneel)</Label>
        <textarea
          id="bericht"
          name="bericht"
          rows={3}
          maxLength={2000}
          placeholder="Vertel kort waarom je geschikt bent."
          className="border-border bg-surface focus-visible:border-navy-500 w-full rounded-lg border p-3 text-sm"
        />
      </div>
      <div>
        <Label htmlFor="uurtariefEuro">
          Jouw uurtarief-voorstel € (optioneel)
        </Label>
        <Input
          id="uurtariefEuro"
          name="uurtariefEuro"
          type="number"
          min={1}
          step="0.5"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Bezig…" : "Reageer op deze opdracht"}
      </Button>
    </form>
  );
}
