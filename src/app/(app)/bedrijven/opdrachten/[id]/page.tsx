import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobStatusBadge } from "@/components/job-status-badge";
import { MatchScore } from "@/components/match-score";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getJobForUser } from "@/server/jobs/service";
import { findKandidatenVoorOpdracht } from "@/server/matching/service";
import { formatEuro } from "@/lib/utils";
import { wijzigOpdrachtStatus } from "../actions";

export const metadata: Metadata = {
  title: "Opdracht",
  robots: { index: false },
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

function StatusKnop({
  jobId,
  status,
  label,
  variant = "outline",
}: {
  jobId: string;
  status: string;
  label: string;
  variant?: "primary" | "accent" | "outline" | "ghost";
}) {
  return (
    <form action={wijzigOpdrachtStatus}>
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant={variant} size="sm">
        {label}
      </Button>
    </form>
  );
}

export default async function OpdrachtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const job = await getJobForUser(user.id, id);
  if (!job) notFound();
  const kandidaten = await findKandidatenVoorOpdracht(job);

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{job.titel}</h1>
          <p className="text-foreground-muted mt-1 text-sm">
            {job.skill.naam}
            {job.specialization ? ` · ${job.specialization.naam}` : ""} ·{" "}
            {job.locatiePlaats}
          </p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Werkzaamheden</CardTitle>
          <p className="text-foreground-muted mt-2 text-sm whitespace-pre-line">
            {job.omschrijving}
          </p>
          {job.requirements.length > 0 ? (
            <div className="mt-4">
              <p className="text-sm font-medium">Vereisten</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.requirements.map((r) => (
                  <Badge key={r.id} variant={r.hard ? "accent" : "neutral"}>
                    {r.certification?.naam ?? r.vrijeTekst}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        <Card>
          <CardTitle>Details</CardTitle>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Start</dt>
              <dd className="font-medium">{datum(job.startdatum)}</dd>
            </div>
            {job.einddatum ? (
              <div className="flex justify-between">
                <dt className="text-foreground-muted">Einde</dt>
                <dd className="font-medium">{datum(job.einddatum)}</dd>
              </div>
            ) : null}
            {job.duurDagen ? (
              <div className="flex justify-between">
                <dt className="text-foreground-muted">Duur</dt>
                <dd className="font-medium">{job.duurDagen} dagen</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Personen</dt>
              <dd className="font-medium">{job.aantalPersonen}</dd>
            </div>
            {job.gewenstUurtariefCents ? (
              <div className="flex justify-between">
                <dt className="text-foreground-muted">Tarief</dt>
                <dd className="font-medium">
                  {formatEuro(job.gewenstUurtariefCents)} p/u
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-foreground-muted">Eigen gereedschap</dt>
              <dd className="font-medium">
                {job.eigenGereedschapGewenst ? "Gewenst" : "Niet vereist"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="mt-6">
        <CardTitle>Status beheren</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {job.status === "CONCEPT" ? (
            <StatusKnop
              jobId={job.id}
              status="GEPUBLICEERD"
              label="Publiceren"
              variant="accent"
            />
          ) : null}
          {job.status === "GEPUBLICEERD" ? (
            <>
              <StatusKnop
                jobId={job.id}
                status="VERVULD"
                label="Markeer als vervuld"
                variant="primary"
              />
              <StatusKnop jobId={job.id} status="GESLOTEN" label="Sluiten" />
            </>
          ) : null}
          {job.status === "GESLOTEN" || job.status === "GEANNULEERD" ? (
            <StatusKnop
              jobId={job.id}
              status="GEPUBLICEERD"
              label="Heropenen"
            />
          ) : null}
          {job.status !== "GEANNULEERD" && job.status !== "VERVULD" ? (
            <StatusKnop
              jobId={job.id}
              status="GEANNULEERD"
              label="Annuleren"
              variant="ghost"
            />
          ) : null}
        </div>
      </Card>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Beste matches{" "}
          <span className="text-foreground-muted font-normal">
            ({kandidaten.length})
          </span>
        </h2>
        {kandidaten.length === 0 ? (
          <Card className="mt-4">
            <CardDescription>
              Nog geen passende, beschikbare vakmensen gevonden. Zodra meer
              ZZP&apos;ers een profiel aanmaken dat bij deze opdracht past,
              verschijnen ze hier.
            </CardDescription>
          </Card>
        ) : (
          <ul className="mt-4 space-y-3">
            {kandidaten.map((k) => (
              <li key={k.zzpProfileId}>
                <Card>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{k.naam}</p>
                        {k.verificatieStatus === "GEVERIFIEERD" ? (
                          <Badge variant="verified">Geverifieerd</Badge>
                        ) : null}
                      </div>
                      <p className="text-foreground-muted text-sm">
                        {[
                          k.plaats,
                          k.jarenErvaring != null
                            ? `${k.jarenErvaring} jaar ervaring`
                            : null,
                          k.uurtariefCents
                            ? `${formatEuro(k.uurtariefCents)} p/u`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="sm:w-64 sm:shrink-0">
                      <MatchScore result={k.result} />
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
