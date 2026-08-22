import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listJobsForUser } from "@/server/jobs/service";
import { findKandidatenVoorOpdracht } from "@/server/matching/service";

export const metadata: Metadata = {
  title: "Kandidaten",
  robots: { index: false },
};

export default async function KandidatenPage() {
  const user = await requireCurrentUser();
  const jobs = (await listJobsForUser(user.id)).filter(
    (j) => j.status === "GEPUBLICEERD",
  );

  const metMatches = await Promise.all(
    jobs.map(async (job) => ({
      job,
      aantal: (await findKandidatenVoorOpdracht(job)).length,
    })),
  );

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Kandidaten</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Bekijk per gepubliceerde opdracht de best passende, beschikbare
        vakmensen.
      </p>

      {metMatches.length === 0 ? (
        <Card className="mt-6">
          <CardTitle>Geen gepubliceerde opdrachten</CardTitle>
          <CardDescription>
            Plaats en publiceer een opdracht om kandidaten te zien.
          </CardDescription>
          <ButtonLink
            href="/bedrijven/opdracht-plaatsen"
            variant="accent"
            className="mt-4"
          >
            Opdracht plaatsen
          </ButtonLink>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {metMatches.map(({ job, aantal }) => (
            <li key={job.id}>
              <Link href={`/bedrijven/opdrachten/${job.id}`}>
                <Card className="hover:border-navy-300 flex items-center justify-between gap-4 transition-colors">
                  <div>
                    <p className="font-semibold">{job.titel}</p>
                    <p className="text-foreground-muted text-sm">
                      {job.skill.naam} · {job.locatiePlaats}
                    </p>
                  </div>
                  <span className="text-navy-800 text-sm font-semibold">
                    {aantal} {aantal === 1 ? "match" : "matches"}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
