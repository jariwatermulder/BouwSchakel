import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getFactuurContext } from "@/server/facturen/service";
import { FactuurForm, type FactuurContext } from "../factuur-form";

export const metadata: Metadata = {
  title: "Nieuwe factuur",
  robots: { index: false },
};

export default async function NieuweFactuurPage() {
  const user = await requireCurrentUser();
  const ctx = await getFactuurContext(user.id);

  if (!ctx) {
    return (
      <Container className="py-8 md:py-12">
        <Card className="max-w-lg">
          <CardTitle>Maak eerst je profiel af</CardTitle>
          <CardDescription>
            Om facturen te maken heb je een zzp-profiel nodig. Vul je profiel
            aan, dan kun je hier facturen opmaken.
          </CardDescription>
          <ButtonLink href="/zzpers/profiel" variant="accent" className="mt-4">
            Naar mijn profiel
          </ButtonLink>
        </Card>
      </Container>
    );
  }

  const p = ctx.profile;
  const naam =
    p.bedrijfsnaam?.trim() ||
    [p.voornaam, p.achternaam].filter(Boolean).join(" ").trim() ||
    "";

  const context: FactuurContext = {
    voorstelNummer: ctx.voorstelNummer,
    afzender: {
      naam,
      adres: p.adres ?? "",
      postcode: p.postcode ?? "",
      plaats: p.plaats ?? "",
      kvk: p.kvkNummer ?? "",
      btwId: p.btwId ?? "",
      iban: p.iban ?? "",
      email: user.email,
    },
    assignments: ctx.assignments.map((a) => ({
      id: a.id,
      jobTitel: a.job.titel,
      tariefEuro:
        a.job.gewenstUurtariefCents != null
          ? a.job.gewenstUurtariefCents / 100
          : p.uurtariefCents != null
            ? p.uurtariefCents / 100
            : null,
      bedrijf: a.company.naam,
      bedrijfKvk: a.company.kvkNummer ?? "",
    })),
  };

  return (
    <Container className="max-w-4xl py-8 md:py-12">
      <Link
        href="/zzpers/facturen"
        className="text-foreground-muted hover:text-foreground text-sm"
      >
        ← Terug naar facturen
      </Link>
      <h1 className="mt-2 text-2xl font-bold md:text-3xl">Nieuwe factuur</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Je gegevens zijn vast ingevuld vanuit je profiel. Pas aan waar nodig.
      </p>
      <div className="mt-8">
        <FactuurForm context={context} />
      </div>
    </Container>
  );
}
