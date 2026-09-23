import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";
import { Card, CardTitle } from "@/components/ui/card";
import { KlachtForm } from "./klacht-form";

export const metadata: Metadata = paginaMetadata({
  pad: "/klachten",
  title: "Klachten",
  index: false,
});

export default function KlachtenPage() {
  return (
    <>
      <PageIntro
        eyebrow="Service"
        title="Klachten"
        lead="We nemen klachten serieus en streven naar een snelle, eerlijke afhandeling."
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm leading-relaxed">
          <p>
            Heb je een klacht over het platform of over een andere gebruiker?
            Dien die hieronder in. We behandelen klachten vertrouwelijk.
          </p>

          <h2 className="text-foreground mt-8 text-lg font-semibold">Zo werkt onze klachtenregeling</h2>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <span className="text-foreground font-medium">Indienen.</span>{" "}
              Vul het formulier hieronder in met je naam, e-mailadres, het
              onderwerp en een omschrijving. Gaat je klacht over een profiel en
              ben je ingelogd, dan kun je dat profiel ook rechtstreeks melden
              via &lsquo;Meld dit profiel&rsquo; op de profielpagina.
            </li>
            <li>
              <span className="text-foreground font-medium">Ontvangst.</span>{" "}
              Je klacht komt terecht bij het beheerteam van ZZP Schakel. We
              bevestigen de ontvangst per e-mail binnen 5 werkdagen.
            </li>
            <li>
              <span className="text-foreground font-medium">Beoordeling.</span>{" "}
              We bekijken de klacht en vragen je waar nodig om aanvulling. Gaat
              het om een andere gebruiker, dan kunnen we die om een reactie
              vragen; we delen daarbij niet meer van je gegevens dan nodig.
            </li>
            <li>
              <span className="text-foreground font-medium">Afhandeling.</span>{" "}
              We streven ernaar je klacht binnen 4 weken af te handelen en
              laten je per e-mail weten wat we hebben besloten en waarom.
              Bij een gegronde klacht over een gebruiker kunnen we een
              waarschuwing geven of een account schorsen of beëindigen (zie
              artikel 9 van de algemene voorwaarden).
            </li>
            <li>
              <span className="text-foreground font-medium">Niet eens met de uitkomst?</span>{" "}
              Laat het ons weten, dan kijken we er nog eens naar. Kom je er met
              ons niet uit, dan is Nederlands recht van toepassing en kun je het
              geschil voorleggen aan de bevoegde rechter in Nederland (artikel
              11 van de algemene voorwaarden). Gaat je klacht over hoe wij met
              je persoonsgegevens omgaan, dan kun je ook terecht bij de
              Autoriteit Persoonsgegevens.
            </li>
          </ol>
          <p>
            Klachten bewaren we tot 2 jaar na afhandeling (zie de
            privacyverklaring). Voor gewone vragen gebruik je het{" "}
            <Link href="/contact" className="text-brand-600 underline">contactformulier</Link>.
          </p>
        </div>

        <Card className="mt-8">
          <CardTitle as="h2">Klacht indienen</CardTitle>
          <div className="mt-4">
            <KlachtForm />
          </div>
        </Card>
      </Container>
    </>
  );
}
