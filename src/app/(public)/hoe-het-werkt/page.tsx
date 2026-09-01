import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";
import { Icon } from "@/components/home/pictos";

export const metadata: Metadata = {
  title: "Hoe het werkt",
  description:
    "Zo werkt ZZP Connect voor bedrijven en zelfstandige zzp’ers.",
};

const bedrijf = [
  "Plaats een opdracht met vakgebied, locatie, startdatum, duur en tarief.",
  "Bekijk passende, beschikbare zzp’ers met matchscore en uitleg.",
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
        eyebrow="Hoe het werkt"
        title="Zo werkt ZZP Connect"
        lead="ZZP Connect brengt bedrijven en zelfstandige zzp’ers bij elkaar. Snel, transparant en op basis van echte match."
      />
      <Container className="grid gap-8 py-12 md:grid-cols-2 md:py-16">
        <Card className="border-t-4" style={{ borderTopColor: "#2563eb" }}>
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#2563eb1a", color: "#2563eb" }}
            >
              <Icon name="doc" className="h-5 w-5" />
            </span>
            <CardTitle>Voor bedrijven</CardTitle>
          </div>
          <ol className="mt-5 space-y-3">
            {bedrijf.map((stap, i) => (
              <li
                key={stap}
                className="text-foreground-muted flex gap-3 text-sm"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {i + 1}
                </span>
                {stap}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="border-t-4" style={{ borderTopColor: "#f59e0b" }}>
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#f59e0b1a", color: "#d97706" }}
            >
              <Icon name="bolt" className="h-5 w-5" />
            </span>
            <CardTitle>Voor ZZP&apos;ers</CardTitle>
          </div>
          <ol className="mt-5 space-y-3">
            {zzp.map((stap, i) => (
              <li
                key={stap}
                className="text-foreground-muted flex gap-3 text-sm"
              >
                <span
                  className="text-ink flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#f59e0b" }}
                >
                  {i + 1}
                </span>
                {stap}
              </li>
            ))}
          </ol>
        </Card>
      </Container>
      <Container className="pb-16">
        <Card className="bg-navy-50 border-navy-100">
          <div className="flex items-start gap-3">
            <span className="bg-navy-800 text-accent-400 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Bemiddeling, geen uitzendbureau</CardTitle>
              <CardDescription>
                ZZP Connect faciliteert het contact tussen opdrachtgever en
                zzp’er. De overeenkomst voor het uitvoeren van het werk komt
                rechtstreeks tussen beide partijen tot stand. ZZP Connect is
                geen werkgever, uitlener of partij bij die overeenkomst.
              </CardDescription>
            </div>
          </div>
        </Card>
      </Container>
    </>
  );
}
