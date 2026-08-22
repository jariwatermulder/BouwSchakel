import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { JobStatusBadge } from "@/components/job-status-badge";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getCompanyForUser } from "@/server/company/service";
import { listJobsForUser } from "@/server/jobs/service";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function BedrijfDashboardPage() {
  const user = await requireCurrentUser();
  const company = await getCompanyForUser(user.id);
  const jobs = await listJobsForUser(user.id);

  const actief = jobs.filter((j) => j.status === "GEPUBLICEERD").length;
  const vervuld = jobs.filter((j) => j.status === "VERVULD").length;
  const naam = company?.naam || user.email.split("@")[0];

  const profielOnvolledig = !company || company.naam.trim() === "";

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Welkom, {naam}</h1>

      {profielOnvolledig ? (
        <Card className="mt-6 flex flex-col items-start gap-3 border-amber-300 bg-amber-50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Rond je bedrijfsprofiel af</CardTitle>
            <CardDescription>
              Vul je bedrijfsnaam en gegevens in voordat je opdrachten plaatst.
            </CardDescription>
          </div>
          <ButtonLink href="/bedrijven/registreren" variant="accent">
            Bedrijfsprofiel
          </ButtonLink>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle>Actieve opdrachten</CardTitle>
          <p className="text-navy-800 mt-2 text-3xl font-extrabold">{actief}</p>
        </Card>
        <Card>
          <CardTitle>Vervuld</CardTitle>
          <p className="text-navy-800 mt-2 text-3xl font-extrabold">
            {vervuld}
          </p>
        </Card>
        <Card>
          <CardTitle>Totaal opdrachten</CardTitle>
          <p className="text-navy-800 mt-2 text-3xl font-extrabold">
            {jobs.length}
          </p>
        </Card>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recente opdrachten</h2>
        <ButtonLink
          href="/bedrijven/opdracht-plaatsen"
          variant="accent"
          size="sm"
        >
          Opdracht plaatsen
        </ButtonLink>
      </div>

      {jobs.length === 0 ? (
        <Card className="mt-4">
          <CardDescription>
            Je hebt nog geen opdrachten geplaatst.
          </CardDescription>
        </Card>
      ) : (
        <ul className="mt-4 space-y-3">
          {jobs.slice(0, 5).map((job) => (
            <li key={job.id}>
              <Link href={`/bedrijven/opdrachten/${job.id}`}>
                <Card className="hover:border-navy-300 flex items-center justify-between gap-4 transition-colors">
                  <div>
                    <p className="font-semibold">{job.titel}</p>
                    <p className="text-foreground-muted text-sm">
                      {job.locatiePlaats}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
