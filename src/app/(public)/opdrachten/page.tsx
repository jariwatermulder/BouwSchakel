import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { Icon } from "@/components/home/pictos";
import { listPublicJobs } from "@/server/jobs/public";
import { formatEuro } from "@/lib/utils";
import { sectorMetaVan } from "@/lib/sector-meta";

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
      {/* Rustige, lichte intro */}
      <section className="from-brand-50/60 border-border border-b bg-gradient-to-b to-transparent">
        <Container className="py-12 md:py-16">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Openstaande opdrachten
          </h1>
          <p className="text-foreground-muted mt-3 max-w-2xl text-lg">
            Opdrachtgevers plaatsen hier klussen. Een opdracht plaatsen is niet
            verplicht — als zzp’er kun je ook gewoon een profiel maken en
            gevonden worden.
          </p>
          <div className="mt-6">
            <ButtonLink href="/vind-zzper" variant="outline" className="rounded-xl">
              Liever zoeken? Vind een zzp’er
            </ButtonLink>
          </div>
        </Container>
      </section>

      <Container className="py-12 md:py-16">
        {jobs.length === 0 ? (
          <Reveal>
            <Card className="mx-auto max-w-lg py-12 text-center">
              <span
                aria-hidden
                className="bg-accent-500/10 text-accent-500 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl"
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
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, i) => {
              const meta = sectorMetaVan(job.skill.slug);
              const geverifieerd =
                job.company.verificatieStatus === "GEVERIFIEERD";
              return (
                <li key={job.id}>
                  <Reveal delayMs={Math.min(i, 5) * 80}>
                    <Link
                      href={`/opdrachten/${job.slug}`}
                      className="group block h-full"
                    >
                      <Card
                        interactive
                        className="h-full border-l-4"
                        style={{ borderLeftColor: meta.kleur }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                            style={{
                              backgroundColor: `${meta.kleur}1a`,
                              color: meta.kleur,
                            }}
                          >
                            <Icon name={meta.icon} className="h-6 w-6" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                                style={{
                                  backgroundColor: `${meta.kleur}1a`,
                                  color: meta.kleur,
                                }}
                              >
                                {job.skill.naam}
                              </span>
                              {geverifieerd ? (
                                <Badge variant="verified">Geverifieerd</Badge>
                              ) : null}
                            </div>
                            <CardTitle className="mt-2 text-lg leading-snug">
                              {job.titel}
                            </CardTitle>
                          </div>
                        </div>

                        <div className="text-foreground-muted mt-4 space-y-1.5 text-sm">
                          <p className="flex items-center gap-2">
                            <Icon
                              name="pin"
                              className="text-foreground-muted/70 h-4 w-4 shrink-0"
                            />
                            {job.locatiePlaats}
                          </p>
                          <p className="flex items-center gap-2">
                            <Icon
                              name="calendar"
                              className="text-foreground-muted/70 h-4 w-4 shrink-0"
                            />
                            Start {datum(job.startdatum)}
                          </p>
                          {job.gewenstUurtariefCents ? (
                            <p className="flex items-center gap-2">
                              <Icon
                                name="euro"
                                className="text-foreground-muted/70 h-4 w-4 shrink-0"
                              />
                              {formatEuro(job.gewenstUurtariefCents)} p/u
                            </p>
                          ) : null}
                        </div>

                        <p
                          className="mt-5 inline-flex items-center gap-1 text-sm font-bold"
                          style={{ color: meta.kleur }}
                        >
                          Pak deze klus
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
              );
            })}
          </ul>
        )}
      </Container>
    </>
  );
}
