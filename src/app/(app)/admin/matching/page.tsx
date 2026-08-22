import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { getMatchingConfig } from "@/server/matching/settings";
import { MatchingForm } from "./matching-form";

export const metadata: Metadata = {
  title: "Matching",
  robots: { index: false },
};

export default async function AdminMatchingPage() {
  await requireCurrentAdmin("SUPPORT");
  const config = await getMatchingConfig();

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Matching-instellingen</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Pas de gewichten en drempels aan zonder codewijziging. Gewichten hoeven
        niet exact op 100 uit te komen; ze worden relatief gewogen.
      </p>
      <Card className="mt-6">
        <CardDescription className="mb-4">
          Wijzigingen gelden direct voor nieuwe matchberekeningen.
        </CardDescription>
        <MatchingForm config={config} />
      </Card>
    </Container>
  );
}
