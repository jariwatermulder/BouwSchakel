import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listApplicationsForZzp } from "@/server/applications/service";

export const metadata: Metadata = {
  title: "Mijn reacties",
  robots: { index: false },
};

const LABEL: Record<string, string> = {
  NIEUW: "Verstuurd",
  BEKEKEN: "Bekeken",
  UITGENODIGD: "Uitgenodigd",
  AFGEWEZEN: "Niet geselecteerd",
  GEACCEPTEERD: "Geselecteerd",
  INGETROKKEN: "Ingetrokken",
};

export default async function ReactiesPage() {
  const user = await requireCurrentUser();
  const applications = await listApplicationsForZzp(user.id);

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Mijn reacties</h1>

      {applications.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>
            Je hebt nog nergens op gereageerd. Bekijk de opdrachten voor jou.
          </CardDescription>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {applications.map((a) => (
            <li key={a.id}>
              <Link href={`/zzpers/opdrachten/${a.jobId}`}>
                <Card className="hover:border-navy-300 flex items-center justify-between gap-4 transition-colors">
                  <div>
                    <CardTitle>{a.job.titel}</CardTitle>
                    <CardDescription>
                      {a.job.company.naam || "Bedrijf"} · {a.job.locatiePlaats}
                      {a.richting === "UITNODIGING" ? " · uitnodiging" : ""}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      a.status === "GEACCEPTEERD"
                        ? "verified"
                        : a.status === "AFGEWEZEN" || a.status === "INGETROKKEN"
                          ? "neutral"
                          : "accent"
                    }
                  >
                    {LABEL[a.status]}
                  </Badge>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
