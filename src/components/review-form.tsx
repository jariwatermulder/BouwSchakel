"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { plaatsReview, type ReviewState } from "@/app/(app)/review-actions";

const initial: ReviewState = {};

const categorieen = [
  { name: "scoreKwaliteit", label: "Kwaliteit" },
  { name: "scoreCommunicatie", label: "Communicatie" },
  { name: "scoreBetrouwbaarheid", label: "Betrouwbaarheid" },
  { name: "scoreAfspraken", label: "Afspraken nakomen" },
] as const;

export function ReviewForm({
  assignmentId,
  basePath,
}: {
  assignmentId: string;
  basePath: string;
}) {
  const [state, formAction, pending] = useActionState(plaatsReview, initial);

  if (state.ok) {
    return (
      <p className="text-sm text-emerald-700">Bedankt voor je beoordeling.</p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="basePath" value={basePath} />
      <div className="grid gap-3 sm:grid-cols-2">
        {categorieen.map((c) => (
          <div key={c.name}>
            <Label htmlFor={c.name}>{c.label}</Label>
            <select
              id={c.name}
              name={c.name}
              required
              defaultValue="5"
              className="border-border bg-surface focus-visible:border-navy-500 h-11 w-full rounded-lg border px-3 text-sm"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ster{n === 1 ? "" : "ren"}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div>
        <Label htmlFor="toelichting">Toelichting (optioneel)</Label>
        <textarea
          id="toelichting"
          name="toelichting"
          rows={3}
          maxLength={2000}
          className="border-border bg-surface focus-visible:border-navy-500 w-full rounded-lg border p-3 text-sm"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? "Bezig…" : "Beoordeling plaatsen"}
      </Button>
    </form>
  );
}
