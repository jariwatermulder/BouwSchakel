import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Instellingen",
  robots: { index: false },
};

export default async function InstellingenPage() {
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

      <Card className="mt-6">
        <CardTitle>Privacy & gegevens</CardTitle>
        <CardDescription className="mt-2">
          Volgens de AVG kun je straks je gegevens exporteren en je account
          verwijderen. Deze functies worden later toegevoegd.
        </CardDescription>
      </Card>

      <Card className="mt-6">
        <CardTitle>Notificaties</CardTitle>
        <CardDescription className="mt-2">
          Voorkeuren voor e-mail- en in-app-notificaties komen binnenkort
          beschikbaar.
        </CardDescription>
      </Card>
    </Container>
  );
}
