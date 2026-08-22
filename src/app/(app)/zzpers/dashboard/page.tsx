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
      <h1 className="text-2xl font-bold md:text-3xl">
        {groet()}, {naam}
      </h1>

      {pct < 100 ? (
        <Card className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Maak je profiel compleet ({pct}%)</CardTitle>
            <CardDescription>
              Een compleet profiel levert betere en meer matches op.
            </CardDescription>
          </div>
          <ButtonLink href="/zzpers/registreren" variant="accent">
            Verder met profiel
          </ButtonLink>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardTitle>Profiel</CardTitle>
          <p className="text-navy-800 mt-2 text-3xl font-extrabold">{pct}%</p>
          <CardDescription>compleet</CardDescription>
        </Card>
        <Card>
          <CardTitle>Beschikbaarheid</CardTitle>
          <p className="text-navy-800 mt-2 text-3xl font-extrabold">
            {profile?.availability.length ?? 0}
          </p>
          <CardDescription>periodes ingesteld</CardDescription>
        </Card>
        <Card>
          <CardTitle>Zichtbaarheid</CardTitle>
          <div className="mt-2">
            {profile?.zichtbaar ? (
              <Badge variant="verified">Zichtbaar voor bedrijven</Badge>
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
        <h2 className="text-lg font-semibold">Opdrachten voor jou</h2>
        <Card className="mt-4">
          <CardDescription>
            Er zijn nog geen passende opdrachten. Zodra bedrijven opdrachten
            plaatsen die bij jouw profiel passen, verschijnen ze hier.
          </CardDescription>
        </Card>
      </section>
    </Container>
  );
}
