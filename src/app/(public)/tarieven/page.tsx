import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PageIntro } from "@/components/layout/page-intro";
import { Icon } from "@/components/home/pictos";

export const metadata: Metadata = {
  title: "Tarieven",
  description: "De tarieven van ZZP Connect — helder en zonder verrassingen.",
};

export default function TarievenPage() {
  return (
    <>
      <PageIntro
        eyebrow="Tarieven"
        title="Helder en zonder verrassingen"
        lead="Een profiel aanmaken en opdrachten bekijken is gratis. Je betaalt pas bij een succesvolle match."
      />
      <Container className="grid gap-8 py-12 md:grid-cols-2 md:py-16">
        <Card className="border-t-4" style={{ borderTopColor: "#16a34a" }}>
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#16a34a1a", color: "#16a34a" }}
            >
              <Icon name="bolt" className="h-5 w-5" />
            </span>
            <CardTitle>ZZP&apos;er</CardTitle>
          </div>
          <p
            className="mt-4 text-4xl font-extrabold"
            style={{ color: "#16a34a" }}
          >
            Gratis
          </p>
          <ul className="mt-4 space-y-2">
            {[
              "Professioneel profiel aanmaken",
              "Beschikbaarheid instellen",
              "Passende opdrachten ontvangen",
            ].map((v) => (
              <li key={v} className="text-foreground-muted flex gap-2 text-sm">
                <span aria-hidden style={{ color: "#16a34a" }}>
                  ✓
                </span>
                {v}
              </li>
            ))}
          </ul>
          <ButtonLink href="/registreren?rol=zzp" variant="accent" className="mt-6">
            Maak een profiel
          </ButtonLink>
        </Card>
        <Card className="border-t-4" style={{ borderTopColor: "#2f5da6" }}>
          <div className="flex items-center gap-3">
            <span className="bg-navy-800 text-accent-400 flex h-11 w-11 items-center justify-center rounded-2xl">
              <Icon name="euro" className="h-5 w-5" />
            </span>
            <CardTitle>Bedrijf</CardTitle>
          </div>
          <p className="text-navy-700 mt-4 text-4xl font-extrabold">Succesfee</p>
          <CardDescription>
            Opdrachten plaatsen is gratis. Bij een succesvolle match geldt een
            bemiddelingsfee. De exacte tarieven worden vóór livegang vastgesteld
            en zijn altijd vooraf transparant.
          </CardDescription>
          <ButtonLink href="/registreren?rol=bedrijf" className="mt-6">
            Plaats een opdracht
          </ButtonLink>
        </Card>
      </Container>
      <Container className="pb-16">
        <p className="text-foreground-muted text-sm">
          Definitieve bedragen en een eventueel abonnement (ZZP Connect Pro)
          worden later bekendgemaakt. Er worden geen kosten in rekening gebracht
          zonder dat dit vooraf duidelijk is.
        </p>
      </Container>
    </>
  );
}
