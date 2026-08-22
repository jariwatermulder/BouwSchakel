import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/review-form";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listAssignmentsForUser } from "@/server/reviews/service";

export const metadata: Metadata = {
  title: "Mijn opdrachten",
  robots: { index: false },
};

const STATUS: Record<string, string> = {
  GEPLAND: "Gepland",
  ACTIEF: "Actief",
  AFGEROND: "Afgerond",
  GEANNULEERD: "Geannuleerd",
  GESCHIL: "Geschil",
};

export default async function ZzpMijnOpdrachtenPage() {
  const user = await requireCurrentUser();
  const assignments = await listAssignmentsForUser(user.id);

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Mijn opdrachten</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Opdrachten waarvoor je bent geselecteerd. Na afronding kun je het
        bedrijf beoordelen.
      </p>

      {assignments.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>
            Je hebt nog geen toegewezen opdrachten.
          </CardDescription>
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {assignments.map((a) => {
            const eigenReview = a.reviews.find(
              (r) => r.richting === "ZZP_NAAR_BEDRIJF",
            );
            return (
              <li key={a.id}>
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{a.job.titel}</CardTitle>
                      <CardDescription>
                        {a.company.naam || "Bedrijf"} · {a.job.locatiePlaats}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={a.status === "AFGEROND" ? "verified" : "accent"}
                    >
                      {STATUS[a.status]}
                    </Badge>
                  </div>

                  {a.status === "AFGEROND" ? (
                    <div className="border-border mt-4 border-t pt-4">
                      {eigenReview ? (
                        <p className="text-sm text-emerald-700">
                          Je hebt dit bedrijf beoordeeld. Bedankt!
                        </p>
                      ) : (
                        <>
                          <p className="mb-3 text-sm font-medium">
                            Beoordeel dit bedrijf
                          </p>
                          <ReviewForm
                            assignmentId={a.id}
                            basePath="/zzpers/mijn-opdrachten"
                          />
                        </>
                      )}
                    </div>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
