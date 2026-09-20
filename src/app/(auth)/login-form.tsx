"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "./actions";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { OAuthKnoppen } from "@/components/auth/oauth-knoppen";
import type { OAuthProvider } from "@/lib/auth/oauth-config";

const initial: AuthFormState = {};

export function LoginForm({
  next,
  providers = [],
  fout,
}: {
  next?: string | null;
  providers?: OAuthProvider[];
  /** Foutmelding uit de OAuth-flow (?fout=…). */
  fout?: string | null;
}) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const registrerenHref = next
    ? `/registreren?next=${encodeURIComponent(next)}`
    : "/registreren";
  const melding = state.error ?? fout ?? null;

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Wachtwoord</Label>
            <Link
              href="/wachtwoord-vergeten"
              className="text-navy-700 text-xs font-medium hover:underline"
            >
              Wachtwoord vergeten?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {melding ? <FormAlert>{melding}</FormAlert> : null}

        <Button type="submit" variant="brand" disabled={pending} className="w-full">
          {pending ? "Bezig…" : "Inloggen"}
        </Button>

        <OAuthKnoppen providers={providers} tekst="Inloggen met" />
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
