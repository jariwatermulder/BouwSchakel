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
import { listApplicationsForJob } from "@/server/applications/service";
import { getAssignmentForJob } from "@/server/reviews/service";
import { ReviewForm } from "@/components/review-form";
import { markeerOpdrachtAfgerond } from "@/app/(app)/review-actions";
import { formatEuro } from "@/lib/utils";
import { wijzigOpdrachtStatus } from "../actions";
import { openGesprek } from "@/app/(app)/message-actions";
import {
  nodigKandidaatUit,
  selecteerKandidaat,
  wijsKandidaatAf,
} from "./application-actions";

const REACTIE_LABEL: Record<string, string> = {
  NIEUW: "Nieuw",
  BEKEKEN: "Bekeken",
  UITGENODIGD: "Uitgenodigd",
  AFGEWEZEN: "Afgewezen",
  GEACCEPTEERD: "Geselecteerd",
  INGETROKKEN: "Ingetrokken",
};

const ASSIGNMENT_STATUS: Record<string, string> = {
  GEPLAND: "Gepland",
  ACTIEF: "Actief",
  AFGEROND: "Afgerond",
  GEANNULEERD: "Geannuleerd",
  GESCHIL: "Geschil",
};

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
  const reacties = await listApplicationsForJob(user.id, job.id);
  const actieveReacties = reacties.filter((a) => a.status !== "INGETROKKEN");
  const assignment = await getAssignmentForJob(user.id, job.id);
  const bedrijfReview = assignment?.reviews.find(
    (r) => r.richting === "BEDRIJF_NAAR_ZZP",
  );

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

      {assignment ? (
        <Card className="mt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Geselecteerde vakman</CardTitle>
              <CardDescription>
                {[
                  assignment.zzpProfile.voornaam,
                  assignment.zzpProfile.achternaam,
                ]
                  .filter(Boolean)
                  .join(" ") || "Vakman"}
              </CardDescription>
            </div>
            <Badge
              variant={assignment.status === "AFGEROND" ? "verified" : "accent"}
            >
              {ASSIGNMENT_STATUS[assignment.status]}
            </Badge>
          </div>

          {assignment.status !== "AFGEROND" &&
          assignment.status !== "GEANNULEERD" ? (
            <form
              action={markeerOpdrachtAfgerond}
              className="mt-4 flex flex-wrap items-end gap-2"
            >
              <input type="hidden" name="assignmentId" value={assignment.id} />
              <input
                type="hidden"
                name="basePath"
                value={`/bedrijven/opdrachten/${job.id}`}
              />
              <div>
                <label
                  htmlFor="gewerkteUren"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Gewerkte uren (optioneel)
                </label>
                <input
                  id="gewerkteUren"
                  name="gewerkteUren"
                  type="number"
                  min={0}
                  className="border-border bg-surface h-11 w-40 rounded-lg border px-3 text-sm"
                />
              </div>
              <Button type="submit" variant="primary">
                Markeer als afgerond
              </Button>
            </form>
          ) : assignment.status === "AFGEROND" ? (
            <div className="border-border mt-4 border-t pt-4">
              {bedrijfReview ? (
                <p className="text-sm text-emerald-700">
                  Je hebt deze vakman beoordeeld.
                </p>
              ) : (
                <>
                  <p className="mb-3 text-sm font-medium">
                    Beoordeel de vakman
                  </p>
                  <ReviewForm
                    assignmentId={assignment.id}
                    basePath={`/bedrijven/opdrachten/${job.id}`}
                  />
                </>
              )}
            </div>
          ) : null}
        </Card>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Reacties{" "}
          <span className="text-foreground-muted font-normal">
            ({actieveReacties.length})
          </span>
        </h2>
        {actieveReacties.length === 0 ? (
          <Card className="mt-4">
            <CardDescription>
              Nog geen reacties. Nodig kandidaten uit via de matches hieronder.
            </CardDescription>
          </Card>
        ) : (
          <ul className="mt-4 space-y-3">
            {actieveReacties.map((a) => {
              const naam =
                [a.zzpProfile.voornaam, a.zzpProfile.achternaam]
                  .filter(Boolean)
                  .join(" ") || "Vakman";
              const afgerond =
                a.status === "GEACCEPTEERD" || a.status === "AFGEWEZEN";
              return (
                <li key={a.id}>
                  <Card>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{naam}</p>
                          <Badge
                            variant={
                              a.status === "GEACCEPTEERD"
                                ? "verified"
                                : "neutral"
                            }
                          >
                            {REACTIE_LABEL[a.status]}
                          </Badge>
                        </div>
                        {a.bericht ? (
                          <p className="text-foreground-muted mt-1 text-sm">
                            {a.bericht}
                          </p>
                        ) : null}
                        {a.uurtariefVoorstelCents ? (
                          <p className="text-foreground-muted mt-1 text-sm">
                            Voorstel: {formatEuro(a.uurtariefVoorstelCents)} p/u
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2 sm:shrink-0">
                        <form action={openGesprek}>
                          <input type="hidden" name="jobId" value={job.id} />
                          <input
                            type="hidden"
                            name="zzpProfileId"
                            value={a.zzpProfileId}
                          />
                          <input
                            type="hidden"
                            name="basePath"
                            value="/bedrijven/berichten"
                          />
                          <Button type="submit" variant="outline" size="sm">
                            Bericht
                          </Button>
                        </form>
                        {!afgerond ? (
                          <>
                            <form action={selecteerKandidaat}>
                              <input
                                type="hidden"
                                name="applicationId"
                                value={a.id}
                              />
                              <input
                                type="hidden"
                                name="jobId"
                                value={job.id}
                              />
                              <Button type="submit" variant="accent" size="sm">
                                Selecteren
                              </Button>
                            </form>
                            <form action={wijsKandidaatAf}>
                              <input
                                type="hidden"
                                name="applicationId"
                                value={a.id}
                              />
                              <input
                                type="hidden"
                                name="jobId"
                                value={job.id}
                              />
                              <Button type="submit" variant="ghost" size="sm">
                                Afwijzen
                              </Button>
                            </form>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
                      <div className="mt-3 flex gap-2">
                        <form action={nodigKandidaatUit}>
                          <input type="hidden" name="jobId" value={job.id} />
                          <input
                            type="hidden"
                            name="zzpProfileId"
                            value={k.zzpProfileId}
                          />
                          <Button type="submit" variant="accent" size="sm">
                            Uitnodigen
                          </Button>
                        </form>
                        <form action={openGesprek}>
                          <input type="hidden" name="jobId" value={job.id} />
                          <input
                            type="hidden"
                            name="zzpProfileId"
                            value={k.zzpProfileId}
                          />
                          <input
                            type="hidden"
                            name="basePath"
                            value="/bedrijven/berichten"
                          />
                          <Button type="submit" variant="outline" size="sm">
                            Bericht
                          </Button>
                        </form>
                      </div>
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
