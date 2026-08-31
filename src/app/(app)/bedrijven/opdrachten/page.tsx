import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { JobStatusBadge } from "@/components/job-status-badge";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listJobsForUser } from "@/server/jobs/service";
import { formatEuro } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mijn opdrachten",
  robots: { index: false },
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

export default async function OpdrachtenPage() {
  const user = await requireCurrentUser();
  const jobs = await listJobsForUser(user.id);

  return (
    <Container className="py-8 md:py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Opdrachten</h1>
        <ButtonLink href="/bedrijven/opdracht-plaatsen" variant="accent">
          Nieuwe opdracht
        </ButtonLink>
      </div>

      {jobs.length === 0 ? (
        <Card className="mt-6">
          <CardTitle>Nog geen opdrachten</CardTitle>
          <CardDescription>
            Plaats je eerste opdracht om geschikte zzp’ers te vinden.
          </CardDescription>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link href={`/bedrijven/opdrachten/${job.id}`}>
                <Card className="hover:border-navy-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{job.titel}</p>
                      <p className="text-foreground-muted text-sm">
                        {job.skill.naam} · {job.locatiePlaats} · start{" "}
                        {datum(job.startdatum)}
                        {job.gewenstUurtariefCents
                          ? ` · ${formatEuro(job.gewenstUurtariefCents)} p/u`
                          : ""}
                      </p>
                    </div>
                    <JobStatusBadge status={job.status} />
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
