import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";
import { Icon } from "@/components/home/pictos";

export const metadata: Metadata = {
  title: "Over ons",
  description: "Het verhaal achter ZZP Schakel.",
};

const waarden = [
  {
    titel: "Eenvoudig",
    tekst: "Zoeken op vakgebied en regio, zonder account en zonder gedoe.",
    icon: "match",
    kleur: "#0e9f6e",
  },
  {
    titel: "Rechtstreeks",
    tekst: "Opdrachtgever en zzp’er maken zelf afspraken, zonder tussenpersoon.",
    icon: "chat",
    kleur: "#0b8457",
  },
  {
    titel: "Focus op de bouw",
    tekst: "We beginnen bij bouw en techniek en groeien van daaruit verder.",
    icon: "grid",
    kleur: "#0a6b48",
  },
];

export default function OverOnsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Over ons"
        title="De juiste zzp’er, op het juiste moment"
        lead="Het verhaal achter ZZP Schakel."
      />
      <Container className="prose max-w-2xl py-12 md:py-16">
        <p className="text-foreground-muted">
          ZZP Schakel is ontstaan uit een simpele observatie: bedrijven
          hebben regelmatig op korte termijn een goede zzp’er nodig, terwijl
          veel zelfstandige zzp’ers juist op zoek zijn naar passend werk in
          hun eigen regio. Die twee vinden elkaar nu vaak via omwegen.
        </p>
        <p className="text-foreground-muted mt-4">
          Wij bouwen een eenvoudig platform dat vraag en aanbod rechtstreeks bij
          elkaar brengt. Opdrachtgevers zoeken op vakgebied en regio en bekijken
          profielen; een opdracht plaatsen is niet nodig. Onze eerste focus is de
          bouw.
        </p>
        <p className="text-foreground-muted mt-4">
          ZZP Schakel is een communicatieplatform. We brengen het contact tot
          stand; de afspraken over het werk, het tarief en de planning maken
          opdrachtgever en zzp’er rechtstreeks met elkaar. Tijdens de introductie
          is het gebruik gratis.
        </p>
      </Container>
      <Container className="pb-16 md:pb-24">
        <div className="grid gap-5 sm:grid-cols-3">
          {waarden.map((w) => (
            <Card
              key={w.titel}
              interactive
              className="border-t-4"
              style={{ borderTopColor: w.kleur }}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${w.kleur}1a`, color: w.kleur }}
              >
                <Icon name={w.icon} className="h-6 w-6" />
              </span>
              <CardTitle className="mt-4">{w.titel}</CardTitle>
              <CardDescription>{w.tekst}</CardDescription>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
}
