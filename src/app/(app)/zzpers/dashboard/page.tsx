import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/match-score";
import { Reveal } from "@/components/reveal";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getProfileWithRelations } from "@/server/zzp/profile";
import { findOpdrachtenVoorZzp } from "@/server/matching/service";
import { formatEuro } from "@/lib/utils";

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
  const matches =
    profile && profile.skills.length > 0
      ? (await findOpdrachtenVoorZzp(user.id)).slice(0, 5)
      : [];

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
              Een compleet profiel levert betere en meer matches op.
            </CardDescription>
          </div>
          <ButtonLink href="/zzpers/registreren" variant="accent">
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Opdrachten voor jou</h2>
          {matches.length > 0 ? (
            <ButtonLink href="/zzpers/opdrachten" variant="ghost" size="sm">
              Alle opdrachten
            </ButtonLink>
          ) : null}
        </div>
        {matches.length === 0 ? (
          <Card className="mt-4">
            <CardDescription>
              Er zijn nog geen passende opdrachten. Zodra bedrijven opdrachten
              plaatsen die bij jouw profiel passen, verschijnen ze hier.
            </CardDescription>
          </Card>
        ) : (
          <ul className="mt-4 space-y-3">
            {matches.map(({ job, result }, i) => (
              <li key={job.id}>
                <Reveal delayMs={Math.min(i, 5) * 70}>
                  <Link
                    href={`/zzpers/opdrachten/${job.id}`}
                    className="group block"
                  >
                    <Card
                      interactive
                      className="group-hover:border-accent-500/60 flex flex-col gap-3 transition-colors sm:flex-row sm:items-start sm:justify-between"
                    >
                    <div>
                      <p className="font-semibold">{job.titel}</p>
                      <p className="text-foreground-muted text-sm">
                        {job.company.naam || "Bedrijf"} · {job.locatiePlaats}
                        {result.afstandKm != null
                          ? ` · ${result.afstandKm} km`
                          : ""}
                        {job.gewenstUurtariefCents
                          ? ` · ${formatEuro(job.gewenstUurtariefCents)} p/u`
                          : ""}
                      </p>
                    </div>
                      <div className="sm:w-52 sm:shrink-0">
                        <MatchScore result={result} compact />
                      </div>
                    </Card>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
