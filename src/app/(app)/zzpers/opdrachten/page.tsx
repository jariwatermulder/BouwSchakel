import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { MatchScore } from "@/components/match-score";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProfileWithRelations } from "@/server/zzp/profile";
import { findOpdrachtenVoorZzp } from "@/server/matching/service";
import { formatEuro } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Opdrachten voor jou",
  robots: { index: false },
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

export default async function ZzpOpdrachtenPage() {
  const user = await requireCurrentUser();
  const profile = await getProfileWithRelations(user.id);
  const matches =
    profile && profile.skills.length > 0
      ? await findOpdrachtenVoorZzp(user.id)
      : [];

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Opdrachten voor jou</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Opdrachten die passen bij jouw vak, beschikbaarheid en werkgebied.
      </p>

      {!profile || profile.skills.length === 0 ? (
        <Card className="mt-6">
          <CardTitle>Maak eerst je profiel compleet</CardTitle>
          <CardDescription>
            Kies je vakgebied en stel je werkgebied en beschikbaarheid in om
            passende opdrachten te zien.
          </CardDescription>
          <ButtonLink
            href="/zzpers/registreren"
            variant="accent"
            className="mt-4"
          >
            Profiel afmaken
          </ButtonLink>
        </Card>
      ) : matches.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>
            Er zijn nu geen passende opdrachten. Zodra bedrijven opdrachten
            plaatsen die bij je profiel passen, verschijnen ze hier.
          </CardDescription>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {matches.map(({ job, result }) => (
            <li key={job.id}>
              <Link href={`/zzpers/opdrachten/${job.id}`}>
                <Card className="hover:border-navy-300 transition-colors">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold">{job.titel}</p>
                      <p className="text-foreground-muted text-sm">
                        {job.company.naam || "Bedrijf"} · {job.locatiePlaats}
                        {result.afstandKm != null
                          ? ` · ${result.afstandKm} km`
                          : ""}{" "}
                        · start {datum(job.startdatum)}
                        {job.gewenstUurtariefCents
                          ? ` · ${formatEuro(job.gewenstUurtariefCents)} p/u`
                          : ""}
                      </p>
                    </div>
                    <div className="sm:w-52 sm:shrink-0">
                      <MatchScore result={result} compact />
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
