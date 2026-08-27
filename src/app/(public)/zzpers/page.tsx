import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Voor ZZP'ers",
  description:
    "Vind passend werk in de bouw. Maak gratis een professioneel profiel op ZZP Connect.",
};

const punten = [
  {
    t: "Passend werk",
    d: "Ontvang alleen opdrachten die aansluiten bij jouw vak, regio en beschikbaarheid.",
  },
  {
    t: "Jij bepaalt",
    d: "Stel zelf je tarief, werkgebied en maximale reisafstand in.",
  },
  {
    t: "Bouw reputatie",
    d: "Verzamel reviews van opdrachtgevers en verhoog je zichtbaarheid.",
  },
];

export default function ZzpLandingPage() {
  return (
    <>
      <PageIntro
        title="Voor ZZP'ers"
        lead="Vind jouw volgende opdracht in bouw, renovatie en installatie — in je eigen regio."
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
          <ButtonLink href="/registreren?rol=zzp" variant="accent" size="lg">
            Maak gratis een profiel
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
