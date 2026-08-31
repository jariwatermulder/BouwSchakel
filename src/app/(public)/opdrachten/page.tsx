import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/reveal";
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
          <Reveal>
            <Card className="mx-auto max-w-lg py-12 text-center">
              <span
                aria-hidden
                className="bg-surface-muted text-accent-500 border-border mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border text-2xl"
              >
                🔍
              </span>
              <CardTitle>Nog geen openstaande opdrachten</CardTitle>
              <CardDescription>
                Er staan op dit moment geen openbare opdrachten. Maak een
                profiel aan, dan ontvang je een melding zodra er iets passends
                is — of plaats zelf een opdracht.
              </CardDescription>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink href="/registreren?rol=zzp" variant="accent">
                  Maak een profiel
                </ButtonLink>
                <ButtonLink href="/registreren?rol=bedrijf" variant="outline">
                  Plaats een opdracht
                </ButtonLink>
              </div>
            </Card>
          </Reveal>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job, i) => (
              <li key={job.id}>
                <Reveal delayMs={Math.min(i, 5) * 80}>
                  <Link
                    href={`/opdrachten/${job.slug}`}
                    className="group block h-full"
                  >
                    <Card
                      interactive
                      className="group-hover:border-accent-500/60 h-full transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-2">
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
                      <p className="text-accent-600 mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                        Bekijk opdracht
                        <span
                          aria-hidden
                          className="transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transform-none"
                        >
                          →
                        </span>
                      </p>
                    </Card>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
