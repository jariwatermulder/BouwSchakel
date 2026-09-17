"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "./actions";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";

const initial: AuthFormState = {};

export function LoginForm({ next }: { next?: string | null }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const registrerenHref = next
    ? `/registreren?next=${encodeURIComponent(next)}`
    : "/registreren";

  return (
    <Card>
      <CardTitle>Inloggen</CardTitle>
      <CardDescription>Welkom terug bij ZZP Schakel.</CardDescription>

      <form action={formAction} className="mt-6 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <div>
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Wachtwoord</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {state.error ? <FormAlert>{state.error}</FormAlert> : null}

        <Button type="submit" variant="brand" disabled={pending} className="w-full">
          {pending ? "Bezig…" : "Inloggen"}
        </Button>
      </form>

      <p className="text-foreground-muted mt-4 text-center text-sm">
        Nog geen account?{" "}
        <Link href={registrerenHref} className="text-navy-700 font-medium">
          Account aanmaken
        </Link>
      </p>
    </Card>
  );
}
