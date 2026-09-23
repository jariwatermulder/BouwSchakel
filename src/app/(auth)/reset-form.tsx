"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ResetFormState } from "./actions";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";

const initial: ResetFormState = {};

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);

  if (!token) {
    return (
      <Card>
        <CardTitle as="h1">Link ongeldig</CardTitle>
        <CardDescription>
          Deze herstel-link is niet compleet. Vraag een nieuwe link aan.
        </CardDescription>
        <p className="mt-6 text-center text-sm">
          <Link href="/wachtwoord-vergeten" className="text-navy-700 font-medium">
            Nieuwe link aanvragen
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle as="h1">Nieuw wachtwoord instellen</CardTitle>
      <CardDescription>Kies een nieuw wachtwoord van minimaal 10 tekens.</CardDescription>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <Label htmlFor="password">Nieuw wachtwoord</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        </div>
        <div>
          <Label htmlFor="password2">Herhaal wachtwoord</Label>
          <Input
            id="password2"
            name="password2"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        </div>

        {state.error ? <FormAlert>{state.error}</FormAlert> : null}

        <Button type="submit" variant="brand" disabled={pending} className="w-full">
          {pending ? "Bezig…" : "Wachtwoord opslaan"}
        </Button>
      </form>

      <p className="text-foreground-muted mt-4 text-center text-sm">
        Link verlopen?{" "}
        <Link href="/wachtwoord-vergeten" className="text-navy-700 font-medium">
          Vraag een nieuwe aan
        </Link>
      </p>
    </Card>
  );
}
