import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { JobPostingJsonLd } from "@/components/job-posting-jsonld";
import { getPublicJobBySlug } from "@/server/jobs/public";
import { formatEuro } from "@/lib/utils";

// Server-side gerenderd op aanvraag (data uit de database); volledig indexeerbaar.
export const dynamic = "force-dynamic";

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getPublicJobBySlug(slug);
  if (!job) return { title: "Opdracht niet gevonden" };
  const titel = `${job.titel} in ${job.locatiePlaats}`;
  const beschrijving = job.omschrijving.slice(0, 155);
  return {
    title: titel,
    description: beschrijving,
    alternates: { canonical: `/opdrachten/${job.slug}` },
    openGraph: { title: titel, description: beschrijving, type: "article" },
  };
}

export default async function PubliekeOpdrachtPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getPublicJobBySlug(slug);
  if (!job) notFound();

  return (
    <Container className="max-w-3xl py-12 md:py-16">
      <JobPostingJsonLd job={job} />
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">{job.skill.naam}</Badge>
        {job.specialization ? (
          <Badge variant="neutral">{job.specialization.naam}</Badge>
        ) : null}
        {job.company.verificatieStatus === "GEVERIFIEERD" ? (
          <Badge variant="verified">Geverifieerd bedrijf</Badge>
        ) : null}
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        {job.titel}
      </h1>
      <p className="text-foreground-muted mt-1">
        {job.company.naam || "Bedrijf"} · {job.locatiePlaats}
      </p>

      <Card className="bs-load mt-8">
        <CardTitle>Werkzaamheden</CardTitle>
        <p className="text-foreground-muted mt-2 whitespace-pre-line">
          {job.omschrijving}
        </p>
      </Card>

      <Card className="bs-load mt-6" style={{ animationDelay: "80ms" }}>
        <CardTitle>Details</CardTitle>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-foreground-muted">Startdatum</dt>
            <dd className="font-medium">{datum(job.startdatum)}</dd>
          </div>
          {job.einddatum ? (
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Einddatum</dt>
              <dd className="font-medium">{datum(job.einddatum)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-foreground-muted">Aantal personen</dt>
            <dd className="font-medium">{job.aantalPersonen}</dd>
          </div>
          {job.gewenstUurtariefCents ? (
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Uurtarief</dt>
              <dd className="font-medium">
                {formatEuro(job.gewenstUurtariefCents)} p/u
              </dd>
            </div>
          ) : null}
        </dl>
      </Card>

      <Card
        className="bs-load mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"
        style={{ animationDelay: "160ms" }}
      >
        <div>
          <CardTitle>Interesse in deze opdracht?</CardTitle>
          <p className="text-foreground-muted text-sm">
            Maak een profiel aan of log in om te reageren.
          </p>
        </div>
        <ButtonLink href="/registreren?rol=zzp" variant="accent">
          Reageer als zzp’er
        </ButtonLink>
      </Card>
    </Container>
  );
}
