import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageIntro } from "@/components/layout/page-intro";
import { listPublicJobs } from "@/server/jobs/public";
import { formatEuro } from "@/lib/utils";

// Server-side gerenderd op aanvraag (data uit de database); volledig indexeerbaar.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Openstaande opdrachten",
  description:
    "Bekijk actuele opdrachten voor zzp’ers in elke sector, door heel Nederland.",
  alternates: { canonical: "/opdrachten" },
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

export default async function OpdrachtenIndexPage() {
  const jobs = await listPublicJobs();

  return (
    <>
      <PageIntro
        title="Openstaande opdrachten"
        lead="Actuele opdrachten in elke sector. Reageer als zzp’er of plaats zelf een opdracht."
      />
      <Container className="py-12 md:py-16">
        {jobs.length === 0 ? (
          <Card>
            <CardTitle>Nog geen opdrachten</CardTitle>
            <CardDescription>
              Er staan op dit moment geen openbare opdrachten. Kom later terug.
            </CardDescription>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/opdrachten/${job.slug}`}>
                  <Card className="hover:border-navy-300 h-full transition-colors">
                    <div className="flex items-center gap-2">
                      <Badge variant="accent">{job.skill.naam}</Badge>
                      {job.company.verificatieStatus === "GEVERIFIEERD" ? (
                        <Badge variant="verified">Geverifieerd</Badge>
                      ) : null}
                    </div>
                    <CardTitle className="mt-3">{job.titel}</CardTitle>
                    <CardDescription>
                      {job.locatiePlaats} · start {datum(job.startdatum)}
                      {job.gewenstUurtariefCents
                        ? ` · ${formatEuro(job.gewenstUurtariefCents)} p/u`
                        : ""}
                    </CardDescription>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
