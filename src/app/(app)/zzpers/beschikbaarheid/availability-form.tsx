"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { voegBeschikbaarheidToe, type BeschikbaarheidState } from "./actions";

const initial: BeschikbaarheidState = {};

export function AvailabilityForm() {
  const [state, formAction, pending] = useActionState(
    voegBeschikbaarheidToe,
    initial,
  );

  return (
    <form
      action={formAction}
      className="grid gap-4 sm:grid-cols-4 sm:items-end"
    >
      <div>
        <Label htmlFor="van">Van</Label>
        <Input id="van" name="van" type="date" required />
      </div>
      <div>
        <Label htmlFor="tot">Tot (optioneel)</Label>
        <Input id="tot" name="tot" type="date" />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          name="type"
          className="border-border bg-surface h-11 w-full rounded-lg border px-3 text-sm"
          defaultValue="FULLTIME"
        >
          <option value="FULLTIME">Fulltime</option>
          <option value="PARTTIME">Parttime</option>
          <option value="INCIDENTEEL">Incidenteel</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Bezig…" : "Toevoegen"}
      </Button>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600 sm:col-span-4">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
