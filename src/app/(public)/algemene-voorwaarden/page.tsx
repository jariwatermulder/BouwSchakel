import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";
import { BEDRIJF } from "@/lib/bedrijfsgegevens";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  robots: { index: false },
  alternates: { canonical: "/algemene-voorwaarden" },
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-foreground mt-8 text-lg font-semibold">{children}</h2>;
}

export default function AlgemeneVoorwaardenPage() {
  return (
    <>
      <PageIntro
        eyebrow="Juridisch"
        title="Algemene voorwaarden"
        lead={`Versie ${BEDRIJF.voorwaardenVersie}. Van toepassing op ieder gebruik van het platform ZZP Schakel.`}
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm leading-relaxed">
          <H>1. Wie wij zijn</H>
          <p>
            ZZP Schakel wordt aangeboden door {BEDRIJF.naam}, gevestigd te{" "}
            {BEDRIJF.adres}, ingeschreven bij de Kamer van Koophandel onder
            nummer {BEDRIJF.kvk}. Bereikbaar via {BEDRIJF.email}.
          </p>

          <H>2. Wat ZZP Schakel is — en niet is</H>
          <p>
            ZZP Schakel is een communicatieplatform dat zelfstandige vakmensen
            (zzp’ers) en opdrachtgevers met elkaar in contact brengt. Wij zijn
            géén partij bij de afspraken die tussen een zzp’er en een
            opdrachtgever tot stand komen, treden niet op als werkgever,
            uitlener, bemiddelaar of uitzendbureau en verrichten geen
            urenregistratie, facturatie of betalingen tussen gebruikers.
            Afspraken over werk, tarief, planning en uitvoering maken
            gebruikers rechtstreeks met elkaar, voor eigen rekening en risico.
          </p>

          <H>3. Account en toegang</H>
          <p>
            Om profielen te bekijken, contact op te nemen of een profiel aan te
            maken is een account nodig. Je bent
            verantwoordelijk voor de geheimhouding van je inloggegevens en voor
            alles wat er met je account gebeurt. Je houdt maximaal één account
            per persoon of onderneming aan, je gegevens zijn juist en actueel
            en je bent minimaal 18 jaar.
          </p>

          <H>4. Gebruiksregels</H>
          <p>Het is niet toegestaan om:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>onjuiste, misleidende of andermans gegevens te plaatsen;</li>
            <li>het platform te gebruiken voor spam, werving voor derden of ongevraagde commerciële berichten;</li>
            <li>gegevens van andere gebruikers te verzamelen of te gebruiken buiten het doel van het platform;</li>
            <li>de werking of beveiliging van het platform te verstoren of te omzeilen;</li>
            <li>inhoud te plaatsen die onrechtmatig, discriminerend, bedreigend of anderszins in strijd met de wet is.</li>
          </ul>

          <H>5. Inhoud die je plaatst</H>
          <p>
            Je blijft eigenaar van de inhoud die je plaatst (zoals profieltekst,
            foto’s en berichten). Je geeft ZZP Schakel een niet-exclusieve,
            kosteloze licentie om die inhoud te tonen en te verwerken voor zover
            nodig om het platform te laten werken. Je staat ervoor in dat je
            daartoe gerechtigd bent en dat de inhoud geen rechten van derden
            schendt.
          </p>

          <H>6. Kosten</H>
          <p>
            Tijdens de introductieperiode is het gebruik van ZZP Schakel gratis.
            Voeren wij in de toekomst betaalde onderdelen in, dan kondigen we dat
            minimaal 30 dagen vooraf aan; bestaande gebruikers gaan nooit
            automatisch iets betalen.
          </p>

          <H>7. Beschikbaarheid en wijzigingen</H>
          <p>
            Wij spannen ons in om het platform beschikbaar en veilig te houden,
            maar garanderen geen ononderbroken werking. We mogen functies
            wijzigen, beperken of beëindigen; onderhoud kondigen we waar
            mogelijk vooraf aan.
          </p>

          <H>8. Aansprakelijkheid</H>
          <p>
            ZZP Schakel is niet aansprakelijk voor de kwaliteit, uitvoering,
            betaling of enig ander aspect van de samenwerking tussen gebruikers,
            noch voor de juistheid van door gebruikers geplaatste gegevens.
            Onze aansprakelijkheid voor directe schade is beperkt tot het bedrag
            dat je in de twaalf maanden vóór de schadeveroorzakende gebeurtenis
            aan ons hebt betaald (tijdens de introductieperiode: € 0), tenzij de
            schade het gevolg is van opzet of bewuste roekeloosheid van ZZP
            Schakel. Dwingend consumentenrecht blijft onverkort gelden.
          </p>

          <H>9. Beëindiging en verwijdering</H>
          <p>
            Je kunt je account op elk moment zelf verwijderen via je
            instellingen; je gegevens worden dan verwijderd of geanonimiseerd
            volgens onze privacyverklaring. Wij mogen een account schorsen of
            beëindigen bij schending van deze voorwaarden, bij misbruik of op
            grond van een wettelijke verplichting — waar mogelijk na een
            waarschuwing.
          </p>

          <H>10. Klachten</H>
          <p>
            Heb je een klacht over het platform of over een andere gebruiker?
            Gebruik onze klachtenregeling. We bevestigen ontvangst binnen 5
            werkdagen en streven naar afhandeling binnen 4 weken. Kom je er met
            ons niet uit, dan geldt artikel 11.
          </p>

          <H>11. Toepasselijk recht en wijzigingen</H>
          <p>
            Op deze voorwaarden is Nederlands recht van toepassing. Geschillen
            worden voorgelegd aan de bevoegde rechter in Nederland, tenzij
            dwingend recht anders bepaalt. Wij kunnen deze voorwaarden wijzigen;
            de actuele versie staat altijd op deze pagina en wezenlijke
            wijzigingen kondigen we vooraf aan.
          </p>
        </div>
      </Container>
    </>
  );
}
