import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { AccountDangerZone } from "@/components/account-danger-zone";

export const metadata: Metadata = {
  title: "Instellingen",
  robots: { index: false },
};

export default async function BedrijfInstellingenPage() {
  const user = await requireCurrentUser();

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Instellingen</h1>

      <Card className="mt-6">
        <CardTitle>Account</CardTitle>
        <div className="mt-3 text-sm">
          <div className="border-border flex justify-between border-b py-2">
            <span className="text-foreground-muted">E-mailadres</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-foreground-muted">E-mail bevestigd</span>
            <span className="font-medium">
              {user.emailVerifiedAt ? "Ja" : "Nog niet"}
            </span>
          </div>
        </div>
      </Card>

      <Card className="mt-6 flex items-center justify-between gap-4">
        <div>
          <CardTitle>Bedrijfsprofiel</CardTitle>
          <CardDescription>
            Beheer je bedrijfsnaam, KvK, contactgegevens en omschrijving.
          </CardDescription>
        </div>
        <ButtonLink href="/bedrijven/registreren" variant="outline">
          Bewerken
        </ButtonLink>
      </Card>

      <AccountDangerZone />
    </Container>
  );
}
