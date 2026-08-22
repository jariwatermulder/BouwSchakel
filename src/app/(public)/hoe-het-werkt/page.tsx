import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Hoe het werkt",
  description:
    "Zo werkt BouwSchakel voor bouwbedrijven en zelfstandige vakmensen.",
};

const bedrijf = [
  "Plaats een opdracht met vakgebied, locatie, startdatum, duur en tarief.",
  "Bekijk passende, beschikbare vakmensen met matchscore en uitleg.",
  "Nodig kandidaten uit en maak rechtstreeks afspraken.",
  "Rond de opdracht af en laat een review achter.",
];

const zzp = [
  "Maak een professioneel profiel: vak, ervaring, tarief en werkgebied.",
  "Stel je beschikbaarheid in.",
  "Ontvang opdrachten die passen bij jouw vak en regio.",
  "Reageer, maak contact en bouw je reputatie op.",
];

export default function HoeHetWerktPage() {
  return (
    <>
      <PageIntro
        title="Hoe het werkt"
        lead="BouwSchakel brengt bouwbedrijven en zelfstandige vakmensen bij elkaar. Snel, transparant en op basis van echte match."
      />
      <Container className="grid gap-8 py-12 md:grid-cols-2 md:py-16">
        <Card>
          <CardTitle>Voor bouwbedrijven</CardTitle>
          <ol className="mt-4 space-y-3">
            {bedrijf.map((stap, i) => (
              <li
                key={stap}
                className="text-foreground-muted flex gap-3 text-sm"
              >
                <span className="bg-navy-800 text-accent-500 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  {i + 1}
                </span>
                {stap}
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <CardTitle>Voor ZZP&apos;ers</CardTitle>
          <ol className="mt-4 space-y-3">
            {zzp.map((stap, i) => (
              <li
                key={stap}
                className="text-foreground-muted flex gap-3 text-sm"
              >
                <span className="bg-navy-800 text-accent-500 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                  {i + 1}
                </span>
                {stap}
              </li>
            ))}
          </ol>
        </Card>
      </Container>
      <Container className="pb-16">
        <Card>
          <CardTitle>Bemiddeling, geen uitzendbureau</CardTitle>
          <CardDescription>
            BouwSchakel faciliteert het contact tussen opdrachtgever en vakman.
            De overeenkomst voor het uitvoeren van het werk komt rechtstreeks
            tussen beide partijen tot stand. BouwSchakel is geen werkgever,
            uitlener of partij bij die overeenkomst.
          </CardDescription>
        </Card>
      </Container>
    </>
  );
}
