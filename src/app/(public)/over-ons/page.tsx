import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";
import { Icon } from "@/components/home/pictos";

export const metadata: Metadata = {
  title: "Over ons",
  description: "Het verhaal achter ZZP Connect.",
};

const waarden = [
  {
    titel: "Transparant",
    tekst: "Heldere matchscores met uitleg en tarieven die je vooraf kent.",
    icon: "match",
    kleur: "#2563eb",
  },
  {
    titel: "Betrouwbaar",
    tekst: "Geverifieerde profielen en reviews na een echte opdracht.",
    icon: "shield",
    kleur: "#16a34a",
  },
  {
    titel: "Voor elke sector",
    tekst: "Van bouw en techniek tot zorg, horeca, transport en IT.",
    icon: "grid",
    kleur: "#c026d3",
  },
];

export default function OverOnsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Over ons"
        title="De juiste zzp’er, op het juiste moment"
        lead="Het verhaal achter ZZP Connect."
      />
      <Container className="prose max-w-2xl py-12 md:py-16">
        <p className="text-foreground-muted">
          ZZP Connect is ontstaan uit een simpele observatie: bedrijven
          hebben regelmatig op korte termijn een goede zzp’er nodig, terwijl
          veel zelfstandige zzp’ers juist op zoek zijn naar passend werk in
          hun eigen regio. Die twee vinden elkaar nu vaak via omwegen.
        </p>
        <p className="text-foreground-muted mt-4">
          Wij bouwen een modern, betrouwbaar platform dat vraag en aanbod
          rechtstreeks bij elkaar brengt — met geverifieerde profielen, eerlijke
          reviews en een transparante matching die uitlegt waarom een zzp’er
          past.
        </p>
        <p className="text-foreground-muted mt-4">
          ZZP Connect is een bemiddelingsplatform. We faciliteren het contact;
          de afspraken over het werk maken opdrachtgever en zzp’er rechtstreeks
          met elkaar.
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
