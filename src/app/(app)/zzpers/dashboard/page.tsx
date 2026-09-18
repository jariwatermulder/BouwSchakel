import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProfileWithRelations } from "@/server/zzp/profile";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

function groet(): string {
  const uur = new Date().getHours();
  if (uur < 12) return "Goedemorgen";
  if (uur < 18) return "Goedemiddag";
  return "Goedenavond";
}

export default async function ZzpDashboardPage() {
  const user = await requireCurrentUser();
  const profile = await getProfileWithRelations(user.id);
  const pct = profile?.profielCompleetheidPct ?? 0;
  const naam = profile?.voornaam ?? user.email.split("@")[0];

  return (
    <Container className="py-8 md:py-12">
      <h1 className="bs-load text-2xl font-bold md:text-3xl">
        {groet()}, {naam}
      </h1>

      {pct < 100 ? (
        <Card className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Maak je profiel compleet ({pct}%)</CardTitle>
            <CardDescription>
              Een compleet profiel wordt vaker bekeken en vaker benaderd door
              opdrachtgevers.
            </CardDescription>
          </div>
          <ButtonLink href="/zzpers/registreren" variant="brand">
            Verder met profiel
          </ButtonLink>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bs-load">
          <CardTitle>Profiel</CardTitle>
          <p className="text-navy-800 mt-2 text-3xl font-extrabold">{pct}%</p>
          <CardDescription>compleet</CardDescription>
        </Card>
        <Card className="bs-load" style={{ animationDelay: "80ms" }}>
          <CardTitle>Beschikbaarheid</CardTitle>
          <p className="text-navy-800 mt-2 text-3xl font-extrabold">
            {profile?.availability.length ?? 0}
          </p>
          <CardDescription>periodes ingesteld</CardDescription>
        </Card>
        <Card className="bs-load" style={{ animationDelay: "160ms" }}>
          <CardTitle>Zichtbaarheid</CardTitle>
          <div className="mt-2">
            {profile?.zichtbaar ? (
              <Badge variant="verified">Zichtbaar voor opdrachtgevers</Badge>
            ) : (
              <Badge variant="pending">Nog niet zichtbaar</Badge>
            )}
          </div>
          <CardDescription className="mt-2">
            Vanaf 60% profiel word je zichtbaar.
          </CardDescription>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Zo word je gevonden</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card>
            <CardTitle>1. Vakgebied en regio</CardTitle>
            <CardDescription>
              Opdrachtgevers zoeken op vakgebied en plaats. Kies je vak precies
              en stel je werkgebied ruim genoeg in.
            </CardDescription>
          </Card>
          <Card>
            <CardTitle>2. Laat zien wat je doet</CardTitle>
            <CardDescription>
              Een korte introductie, je ervaring en een paar afgeronde projecten
              maken het verschil in de zoekresultaten.
            </CardDescription>
          </Card>
          <Card>
            <CardTitle>3. Reageer snel</CardTitle>
            <CardDescription>
              Nieuwe berichten van opdrachtgevers vind je onder Berichten. Je
              krijgt er ook een e-mail van.
            </CardDescription>
          </Card>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href="/zzpers/profiel" variant="brand">
            Bekijk mijn profiel
          </ButtonLink>
          <ButtonLink href="/zzpers/berichten" variant="outline">
            Naar berichten
          </ButtonLink>
        </div>
      </section>
    </Container>
  );
}
