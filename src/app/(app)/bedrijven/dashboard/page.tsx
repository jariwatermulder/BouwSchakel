import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getCompanyForUser } from "@/server/company/service";
import { unreadMessagesCount } from "@/server/messaging/service";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function BedrijfDashboardPage() {
  const user = await requireCurrentUser();
  const [company, ongelezen] = await Promise.all([
    getCompanyForUser(user.id),
    unreadMessagesCount(user.id),
  ]);
  const naam = company?.naam || user.email.split("@")[0];
  const profielOnvolledig = !company || company.naam.trim() === "";

  return (
    <Container className="py-8 md:py-12">
      <h1 className="bs-load text-2xl font-bold md:text-3xl">Welkom, {naam}</h1>

      {profielOnvolledig ? (
        <Card className="mt-6 flex flex-col items-start gap-3 border-amber-300 bg-amber-50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Rond je bedrijfsprofiel af</CardTitle>
            <CardDescription>
              Met je bedrijfsnaam erbij weten zzp’ers direct wie hen benadert.
            </CardDescription>
          </div>
          <ButtonLink href="/bedrijven/registreren" variant="brand">
            Bedrijfsprofiel
          </ButtonLink>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="bs-load flex flex-col">
          <CardTitle>Vind een zzp’er</CardTitle>
          <CardDescription>
            Zoek op vakgebied en regio, bekijk profielen en neem rechtstreeks
            contact op. Geen opdracht plaatsen nodig.
          </CardDescription>
          <div className="mt-4">
            <ButtonLink href="/vind-zzper" variant="brand">
              Zoek vakmensen
            </ButtonLink>
          </div>
        </Card>
        <Card className="bs-load flex flex-col" style={{ animationDelay: "80ms" }}>
          <CardTitle>Berichten</CardTitle>
          <p className="text-navy-800 mt-2 text-3xl font-extrabold">{ongelezen}</p>
          <CardDescription>ongelezen</CardDescription>
          <div className="mt-4">
            <ButtonLink href="/bedrijven/berichten" variant="outline">
              Naar berichten
            </ButtonLink>
          </div>
        </Card>
      </div>
    </Container>
  );
}
