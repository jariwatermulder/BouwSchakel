import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getFactuurContext } from "@/server/facturen/service";
import { FactuurForm } from "@/components/facturen/factuur-form";

export const metadata: Metadata = {
  title: "Nieuwe factuur",
  robots: { index: false },
};

export default async function NieuweBedrijfsfactuurPage() {
  const user = await requireCurrentUser();
  const context = await getFactuurContext(user.id, user.email);

  if (!context) {
    return (
      <Container className="py-8 md:py-12">
        <Card className="max-w-lg">
          <CardTitle>Maak eerst je bedrijfsprofiel af</CardTitle>
          <CardDescription>
            Om facturen te maken heb je een bedrijfsprofiel nodig. Vul je
            gegevens aan, dan kun je hier facturen opmaken.
          </CardDescription>
          <ButtonLink href="/bedrijven/registreren" variant="accent" className="mt-4">
            Naar bedrijfsprofiel
          </ButtonLink>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="max-w-4xl py-8 md:py-12">
      <Link
        href="/bedrijven/facturen"
        className="text-foreground-muted hover:text-foreground text-sm"
      >
        ← Terug naar facturen
      </Link>
      <h1 className="mt-2 text-2xl font-bold md:text-3xl">Nieuwe factuur</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Maak een factuur voor je klant, in de huisstijl van ZZP Connect.
      </p>
      <div className="mt-8">
        <FactuurForm context={context} basisPad="/bedrijven/facturen" />
      </div>
    </Container>
  );
}
