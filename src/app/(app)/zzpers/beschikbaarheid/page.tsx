import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProfileWithRelations } from "@/server/zzp/profile";
import { AvailabilityForm } from "./availability-form";
import { verwijderBeschikbaarheid } from "./actions";

export const metadata: Metadata = {
  title: "Beschikbaarheid",
  robots: { index: false },
};

const typeLabel: Record<string, string> = {
  FULLTIME: "Fulltime",
  PARTTIME: "Parttime",
  INCIDENTEEL: "Incidenteel",
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

export default async function BeschikbaarheidPage() {
  const user = await requireCurrentUser();
  const profile = await getProfileWithRelations(user.id);
  const periodes = profile?.availability ?? [];

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Beschikbaarheid</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Geef aan wanneer je beschikbaar bent. Dit weegt zwaar mee in de
        matching.
      </p>

      <Card className="mt-6">
        <CardTitle>Periode toevoegen</CardTitle>
        <div className="mt-4">
          <AvailabilityForm />
        </div>
      </Card>

      <Card className="mt-6">
        <CardTitle>Ingestelde periodes</CardTitle>
        {periodes.length === 0 ? (
          <CardDescription className="mt-2">
            Je hebt nog geen beschikbaarheid ingesteld.
          </CardDescription>
        ) : (
          <ul className="mt-3 space-y-2">
            {periodes.map((a) => (
              <li
                key={a.id}
                className="border-border flex items-center justify-between gap-4 border-b py-2 text-sm last:border-0"
              >
                <span className="flex items-center gap-3">
                  <Badge variant="accent">{typeLabel[a.type]}</Badge>
                  {datum(a.van)}
                  {a.tot ? ` — ${datum(a.tot)}` : " — doorlopend"}
                </span>
                <form action={verwijderBeschikbaarheid}>
                  <input type="hidden" name="id" value={a.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:underline"
                  >
                    Verwijderen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
}
