"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "./actions";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initial: AuthFormState = {};

export function RegisterForm({
  defaultRole,
}: {
  defaultRole: "ZZP" | "COMPANY";
}) {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <Card>
      <CardTitle>Account aanmaken</CardTitle>
      <CardDescription>
        {defaultRole === "COMPANY"
          ? "Als bouwbedrijf plaats je opdrachten en vind je vakmensen."
          : "Als ZZP'er maak je een profiel en vind je passende opdrachten."}
      </CardDescription>

      <form action={formAction} className="mt-6 space-y-4">
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Ik ben een…</legend>
          <div className="grid grid-cols-2 gap-2">
            <label className="border-border has-[:checked]:border-navy-500 has-[:checked]:bg-navy-50 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
              <input
                type="radio"
                name="role"
                value="ZZP"
                defaultChecked={defaultRole === "ZZP"}
              />
              ZZP&apos;er
            </label>
            <label className="border-border has-[:checked]:border-navy-500 has-[:checked]:bg-navy-50 flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
              <input
                type="radio"
                name="role"
                value="COMPANY"
                defaultChecked={defaultRole === "COMPANY"}
              />
              Bouwbedrijf
            </label>
          </div>
        </fieldset>

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
            autoComplete="new-password"
            minLength={10}
            required
          />
          <p className="text-foreground-muted mt-1 text-xs">
            Minimaal 10 tekens.
          </p>
        </div>

        {state.error ? (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Bezig…" : "Account aanmaken"}
        </Button>
      </form>

      <p className="text-foreground-muted mt-4 text-center text-sm">
        Al een account?{" "}
        <Link href="/inloggen" className="text-navy-700 font-medium">
          Inloggen
        </Link>
      </p>
    </Card>
  );
}
