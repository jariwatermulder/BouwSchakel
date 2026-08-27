import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Tarieven",
  description: "De tarieven van ZZP Connect — helder en zonder verrassingen.",
};

export default function TarievenPage() {
  return (
    <>
      <PageIntro
        title="Tarieven"
        lead="Een profiel aanmaken en opdrachten bekijken is gratis. Je betaalt pas bij een succesvolle match."
      />
      <Container className="grid gap-8 py-12 md:grid-cols-2 md:py-16">
        <Card>
          <CardTitle>ZZP&apos;er</CardTitle>
          <p className="mt-2 text-3xl font-extrabold">Gratis</p>
          <CardDescription>
            Profiel aanmaken, beschikbaarheid instellen en opdrachten ontvangen
            kost niets.
          </CardDescription>
          <ButtonLink href="/registreren?rol=zzp" className="mt-6">
            Maak een profiel
          </ButtonLink>
        </Card>
        <Card>
          <CardTitle>Bouwbedrijf</CardTitle>
          <p className="mt-2 text-3xl font-extrabold">Succesfee</p>
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
