import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchScore } from "@/components/match-score";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPublishedJob } from "@/server/jobs/service";
import { scoreOpdrachtVoorZzp } from "@/server/matching/service";
import { formatEuro } from "@/lib/utils";
import { db } from "@/lib/db";
import { openGesprek } from "@/app/(app)/message-actions";
import { ApplyForm } from "./apply-form";
import { trekReactieIn } from "./apply-actions";

const APPLICATION_STATUS_LABEL: Record<string, string> = {
  NIEUW: "Verstuurd",
  BEKEKEN: "Bekeken door bedrijf",
  UITGENODIGD: "Uitgenodigd",
  AFGEWEZEN: "Niet geselecteerd",
  GEACCEPTEERD: "Geselecteerd",
  INGETROKKEN: "Ingetrokken",
};

export const metadata: Metadata = {
  title: "Opdracht",
  robots: { index: false },
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(d);
}

export default async function ZzpOpdrachtDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const job = await getPublishedJob(id);
  if (!job) notFound();
  const result = await scoreOpdrachtVoorZzp(user.id, job);

  const profile = await db.zZPProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  const application = profile
    ? await db.application.findUnique({
        where: {
          jobId_zzpProfileId: { jobId: id, zzpProfileId: profile.id },
        },
      })
    : null;

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{job.titel}</h1>
          <p className="text-foreground-muted mt-1 text-sm">
            {job.company.naam || "Bedrijf"} · {job.skill.naam}
            {job.specialization ? ` · ${job.specialization.naam}` : ""} ·{" "}
            {job.locatiePlaats}
          </p>
        </div>
        {job.company.verificatieStatus === "GEVERIFIEERD" ? (
          <Badge variant="verified">Geverifieerd bedrijf</Badge>
        ) : null}
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

        <div className="space-y-6">
          {result ? (
            <Card>
              <CardTitle>Jouw match</CardTitle>
              <div className="mt-2">
                <MatchScore result={result} />
              </div>
            </Card>
          ) : null}

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
            </dl>
          </Card>

          <Card>
            <CardTitle>Reageren</CardTitle>
            {!profile ? (
              <CardDescription className="mt-2">
                Maak eerst je profiel compleet om te kunnen reageren.
              </CardDescription>
            ) : application &&
              application.status !== "INGETROKKEN" &&
              application.status !== "AFGEWEZEN" ? (
              <div className="mt-2 space-y-3">
                <Badge variant="accent">
                  {APPLICATION_STATUS_LABEL[application.status]}
                </Badge>
                <form action={openGesprek}>
                  <input type="hidden" name="jobId" value={job.id} />
                  <input type="hidden" name="zzpProfileId" value={profile.id} />
                  <input
                    type="hidden"
                    name="basePath"
                    value="/zzpers/berichten"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Bericht sturen
                  </Button>
                </form>
                {application.status === "NIEUW" ||
                application.status === "UITGENODIGD" ? (
                  <form action={trekReactieIn}>
                    <input
                      type="hidden"
                      name="applicationId"
                      value={application.id}
                    />
                    <input type="hidden" name="jobId" value={job.id} />
                    <button
                      type="submit"
                      className="text-sm text-red-600 hover:underline"
                    >
                      Reactie intrekken
                    </button>
                  </form>
                ) : null}
              </div>
            ) : (
              <div className="mt-3">
                <ApplyForm jobId={job.id} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </Container>
  );
}
