import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { JobPostingJsonLd } from "@/components/job-posting-jsonld";
import { Icon } from "@/components/home/pictos";
import { getPublicJobBySlug } from "@/server/jobs/public";
import { formatEuro } from "@/lib/utils";
import { sectorMetaVan } from "@/lib/sector-meta";

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

  const meta = sectorMetaVan(job.skill.slug);

  return (
    <Container className="max-w-3xl py-12 md:py-16">
      <JobPostingJsonLd job={job} />

      {/* Kleurrijke, sector-gekleurde kop */}
      <div
        className="rounded-[var(--radius-card)] border-l-4 p-6 md:p-8"
        style={{ borderLeftColor: meta.kleur, backgroundColor: `${meta.kleur}0d` }}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${meta.kleur}1f`, color: meta.kleur }}
          >
            <Icon name={meta.icon} className="h-7 w-7" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ backgroundColor: `${meta.kleur}1a`, color: meta.kleur }}
              >
                {job.skill.naam}
              </span>
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
            <p className="text-foreground-muted mt-1 flex items-center gap-1.5">
              <Icon name="pin" className="h-4 w-4" />
              {job.company.naam || "Bedrijf"} · {job.locatiePlaats}
            </p>
          </div>
        </div>
      </div>

      <Card className="bs-load mt-6">
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
        className="bs-load mt-6 flex flex-col items-start gap-3 border-l-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          animationDelay: "160ms",
          borderLeftColor: meta.kleur,
          backgroundColor: `${meta.kleur}0d`,
        }}
      >
        <div>
          <CardTitle>Interesse in deze klus?</CardTitle>
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
