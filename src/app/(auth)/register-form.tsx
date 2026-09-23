"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "./actions";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { OAuthKnoppen } from "@/components/auth/oauth-knoppen";
import type { OAuthProvider } from "@/lib/auth/oauth-config";

const initial: AuthFormState = {};

type Rol = "ZZP" | "COMPANY";

/** Uitleg en vervolgstappen per rol, zodat een bezoeker weet wat er na aanmelden gebeurt. */
const ROLLEN: Record<
  Rol,
  { label: string; sub: string; intro: (naarZoekopdracht: boolean) => string; stappen: string[] }
> = {
  COMPANY: {
    label: "Ik zoek een vakman",
    sub: "Opdrachtgever met KvK-nummer",
    intro: (naarZoekopdracht) =>
      naarZoekopdracht
        ? "Maak gratis een account aan en bekijk de vakmensen voor jouw zoekopdracht. Je komt daarna direct terug bij je zoekresultaten."
        : "Maak gratis een account aan en bekijk direct de profielen van vakmensen in jouw regio.",
    stappen: [
      "Account aanmaken met je e-mailadres (of via Google/Apple).",
      "Bedrijfsnaam en KvK-nummer invullen: dat is alles wat we nodig hebben.",
      "Profielen bekijken en rechtstreeks contact opnemen via een bericht.",
    ],
  },
  ZZP: {
    label: "Ik ben zzp’er",
    sub: "Zelfstandige vakman met KvK-nummer",
    intro: () =>
      "Maak gratis een profiel aan zodat opdrachtgevers in jouw regio je kunnen vinden en rechtstreeks contact opnemen.",
    stappen: [
      "Account aanmaken met je e-mailadres (of via Google/Apple).",
      "Je profiel opbouwen: naam, KvK-nummer, vakgebied en werkgebied. Duurt een paar minuten.",
      "Zodra de basis erin staat ben je vindbaar en ontvang je berichten van opdrachtgevers.",
    ],
  },
};

export function RegisterForm({
  defaultRole,
  next,
  providers = [],
  fout,
}: {
  defaultRole: Rol;
  next?: string | null;
  providers?: OAuthProvider[];
  /** Foutmelding uit de OAuth-flow (?fout=…). */
  fout?: string | null;
}) {
  const [state, formAction, pending] = useActionState(registerAction, initial);
  const [rol, setRol] = useState<Rol>(defaultRole);
  const inloggenHref = next
    ? `/inloggen?next=${encodeURIComponent(next)}`
    : "/inloggen";
  const melding = state.error ?? fout ?? null;
  const naarZoekopdracht = !!next && next.startsWith("/vind-zzper");
  const info = ROLLEN[rol];

  return (
    <Card>
      <CardTitle as="h1">Account aanmaken</CardTitle>
      <CardDescription>{info.intro(naarZoekopdracht)}</CardDescription>

      <form action={formAction} className="mt-6 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">Wat wil je doen?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["COMPANY", "ZZP"] as const).map((r) => (
              <label
                key={r}
                className="border-border has-[:checked]:border-navy-500 has-[:checked]:bg-navy-50 flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm"
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={rol === r}
                  onChange={() => setRol(r)}
                  className="mt-0.5"
                />
                <span>
                  <span className="text-foreground block font-medium">{ROLLEN[r].label}</span>
                  <span className="text-foreground-muted block text-xs">{ROLLEN[r].sub}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="text-foreground-muted mt-2 text-xs">
            ZZP Schakel is bedoeld voor zakelijke opdrachtgevers en zelfstandige
            vakmensen; bij beide rollen vul je na het aanmaken een KvK-nummer in.
          </p>
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

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="akkoord"
            required
            className="accent-brand-500 mt-0.5 h-4 w-4 shrink-0"
          />
          <span className="text-foreground-muted">
            Ik ga akkoord met de{" "}
            <Link href="/algemene-voorwaarden" target="_blank" className="text-navy-700 font-medium underline">
              algemene voorwaarden
            </Link>{" "}
            en heb de{" "}
            <Link href="/privacy" target="_blank" className="text-navy-700 font-medium underline">
              privacyverklaring
            </Link>{" "}
            gelezen.
          </span>
        </label>

        {melding ? <FormAlert>{melding}</FormAlert> : null}

        <Button type="submit" variant="brand" disabled={pending} className="w-full">
          {pending ? "Bezig…" : "Account aanmaken"}
        </Button>

        {/* Zelfde formulier: rol en akkoord gaan mee naar Google/Apple. */}
        <OAuthKnoppen providers={providers} tekst="Registreren met" />
      </form>

      <div className="bg-surface-muted mt-6 rounded-xl p-4">
        <p className="text-foreground text-sm font-semibold">Wat gebeurt er hierna?</p>
        <ol className="text-foreground-muted mt-2 space-y-1.5 text-sm">
          {info.stappen.map((stap, i) => (
            <li key={stap} className="flex gap-2">
              <span className="bg-brand-50 text-brand-700 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {i + 1}
              </span>
              {stap}
            </li>
          ))}
        </ol>
        <p className="text-foreground-muted mt-2 text-xs">
          Je ontvangt een e-mail om je adres te bevestigen. Gratis tijdens de
          introductie; je gaat nooit automatisch betalen.
        </p>
      </div>

      <p className="text-foreground-muted mt-4 text-center text-sm">
        Al een account?{" "}
        <Link href={inloggenHref} className="text-navy-700 font-medium">
          Inloggen
        </Link>
      </p>
    </Card>
  );
}
