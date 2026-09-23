"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, type ForgotFormState } from "./actions";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";

const initial: ForgotFormState = {};

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);

  if (state.ok) {
    return (
      <Card>
        <CardTitle as="h1">Controleer je e-mail</CardTitle>
        <CardDescription>
          Als er een account bestaat voor dit e-mailadres, hebben we een link
          gestuurd waarmee je een nieuw wachtwoord kunt instellen. De link is
          één uur geldig. Geen e-mail ontvangen? Controleer je spam-map.
        </CardDescription>
        <p className="text-foreground-muted mt-6 text-center text-sm">
          <Link href="/inloggen" className="text-navy-700 font-medium">
            Terug naar inloggen
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle as="h1">Wachtwoord vergeten</CardTitle>
      <CardDescription>
        Vul je e-mailadres in. Je ontvangt een link om een nieuw wachtwoord in
        te stellen.
      </CardDescription>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">E-mailadres</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        {state.error ? <FormAlert>{state.error}</FormAlert> : null}

        <Button type="submit" variant="brand" disabled={pending} className="w-full">
          {pending ? "Bezig…" : "Stuur herstel-link"}
        </Button>
      </form>

      <p className="text-foreground-muted mt-4 text-center text-sm">
        <Link href="/inloggen" className="text-navy-700 font-medium">
          Terug naar inloggen
        </Link>
      </p>
    </Card>
  );
}
