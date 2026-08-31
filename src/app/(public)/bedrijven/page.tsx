import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Voor bedrijven",
  description:
    "Vind snel geverifieerde, beschikbare zzp’ers voor je opdrachten.",
};

const punten = [
  {
    t: "Snel geregeld",
    d: "Plaats een opdracht in ongeveer twee minuten en ontvang direct passende kandidaten.",
  },
  {
    t: "Transparante match",
    d: "Elke kandidaat heeft een matchscore met uitleg — je ziet precies waarom iemand past.",
  },
  {
    t: "Vertrouwen",
    d: "Geverifieerde profielen en reviews van eerdere opdrachtgevers.",
  },
];

export default function BedrijvenLandingPage() {
  return (
    <>
      <PageIntro
        title="Voor bedrijven"
        lead="Vandaag een zzp’er nodig? Vind snel een geschikte, beschikbare en betrouwbare ZZP'er."
      />
      <Container className="py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {punten.map((p) => (
            <Card key={p.t}>
              <CardTitle>{p.t}</CardTitle>
              <CardDescription>{p.d}</CardDescription>
            </Card>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink
            href="/registreren?rol=bedrijf"
            variant="accent"
            size="lg"
          >
            Plaats een opdracht
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
