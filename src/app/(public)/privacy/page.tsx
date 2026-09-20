import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";
import { BEDRIJF } from "@/lib/bedrijfsgegevens";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  robots: { index: false },
  alternates: { canonical: "/privacy" },
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-foreground mt-8 text-lg font-semibold">{children}</h2>;
}

const verwerkingen = [
  {
    doel: "Account aanmaken en inloggen",
    gegevens: "e-mailadres, wachtwoord (alleen als hash), rol, tijdstip van inloggen; IP-adres en browser per sessie",
    grondslag: "Uitvoering van de overeenkomst (art. 6 lid 1 sub b AVG)",
    bewaartermijn: "Zolang je account bestaat; sessies maximaal 30 dagen",
  },
  {
    doel: "Openbaar zzp-profiel tonen",
    gegevens: "naam, vakgebied(en), werkgebied en reisafstand, ervaring, beschikbaarheid, tarief, portfolio, eventueel bedrijfsnaam en KvK-nummer",
    grondslag: "Uitvoering van de overeenkomst; jij bepaalt zelf wat je invult",
    bewaartermijn: "Zolang je profiel bestaat",
  },
  {
    doel: "Contact tussen gebruikers (berichten)",
    gegevens: "berichtinhoud, afzender, ontvanger, tijdstip",
    grondslag: "Uitvoering van de overeenkomst",
    bewaartermijn: "Tot 12 maanden na het laatste bericht, of eerder bij verwijdering van je account",
  },
  {
    doel: "Documenten en verificatie (optioneel)",
    gegevens: "door jou geüploade documenten, zoals certificaten of een KvK-uittreksel",
    grondslag: "Toestemming (art. 6 lid 1 sub a AVG); intrekbaar door het document te verwijderen",
    bewaartermijn: "Tot je het document verwijdert of je account beëindigt",
  },
  {
    doel: "E-mails (verificatie, wachtwoord-herstel, melding van nieuw bericht)",
    gegevens: "e-mailadres, inhoud van de melding",
    grondslag: "Uitvoering van de overeenkomst; meldingen zijn instelbaar",
    bewaartermijn: "Verzendlogs maximaal 90 dagen",
  },
  {
    doel: "Contactverzoeken, klachten en meldingen",
    gegevens: "naam, e-mailadres, inhoud van je bericht, IP-adres (misbruikpreventie)",
    grondslag: "Gerechtvaardigd belang (afhandeling) of wettelijke verplichting",
    bewaartermijn: "Tot 2 jaar na afhandeling",
  },
  {
    doel: "Eigen bezoekersstatistieken (geen Google Analytics)",
    gegevens: "pseudoniem bezoekers- en sessienummer, bezochte pagina's, herkomst (alleen domeinnaam), apparaattype, browser en besturingssysteem, uitgevoerde acties zoals zoeken of contact opnemen; geen IP-adres; bij ingelogde gebruikers gekoppeld aan het account-id",
    grondslag: "Gerechtvaardigd belang (art. 6 lid 1 sub f AVG): begrijpen en verbeteren van het platform",
    bewaartermijn: "Maximaal 24 maanden; bij verwijdering van je account wordt de koppeling met je account direct verwijderd",
  },
  {
    doel: "Beveiliging, misbruikpreventie en audit",
    gegevens: "IP-adres, tijdstippen, technische logregels, auditlog van accountacties (zoals instemming met de voorwaarden)",
    grondslag: "Gerechtvaardigd belang (art. 6 lid 1 sub f AVG)",
    bewaartermijn: "Maximaal 12 maanden",
  },
  {
    doel: "Wettelijke bewaarplichten",
    gegevens: "eventuele financiële administratie",
    grondslag: "Wettelijke verplichting (art. 6 lid 1 sub c AVG)",
    bewaartermijn: "7 jaar (fiscale bewaarplicht)",
  },
];

const verwerkers = [
  {
    naam: "Vercel Inc.",
    doel: "hosting van website en applicatie",
    locatie: "EU-regio; eventuele doorgifte naar de VS onder het EU-VS Data Privacy Framework",
  },
  {
    naam: "Supabase Inc.",
    doel: "database en bestandsopslag",
    locatie: "EU (Frankfurt)",
  },
  {
    naam: "Resend, Inc.",
    doel: "verzenden van transactionele e-mails",
    locatie: "VS, onder standaardcontractbepalingen",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        eyebrow="Juridisch"
        title="Privacyverklaring"
        lead={`Versie ${BEDRIJF.voorwaardenVersie}. Zo gaat ZZP Schakel met je persoonsgegevens om.`}
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm leading-relaxed">
          <H>1. Verwerkingsverantwoordelijke</H>
          <p>
            {BEDRIJF.naam}, {BEDRIJF.adres}, KvK {BEDRIJF.kvk}, is
            verantwoordelijk voor de verwerking van persoonsgegevens via ZZP
            Schakel. Vragen over privacy: {BEDRIJF.email}.
          </p>

          <H>2. Welke gegevens, waarvoor, op welke grondslag en hoe lang</H>
          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted text-foreground">
                <tr>
                  <th className="p-3 font-semibold">Doel</th>
                  <th className="p-3 font-semibold">Gegevens</th>
                  <th className="p-3 font-semibold">Grondslag</th>
                  <th className="p-3 font-semibold">Bewaartermijn</th>
                </tr>
              </thead>
              <tbody>
                {verwerkingen.map((v) => (
                  <tr key={v.doel} className="border-border border-t align-top">
                    <td className="text-foreground p-3 font-medium">{v.doel}</td>
                    <td className="p-3">{v.gegevens}</td>
                    <td className="p-3">{v.grondslag}</td>
                    <td className="p-3">{v.bewaartermijn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            We verwerken niet meer dan nodig is om vakmensen en opdrachtgevers
            met elkaar in contact te brengen. We verkopen geen gegevens, tonen
            geen advertenties en nemen geen geautomatiseerde besluiten met
            rechtsgevolgen.
          </p>

          <H>3. Wie je gegevens ziet</H>
          <p>
            Je profiel is zichtbaar voor bezoekers van het platform die zijn
            ingelogd met een account; jij bepaalt wat je daarin opneemt. Je
            e-mailadres en telefoonnummer tonen we niet openbaar; contact
            verloopt via berichten binnen het platform. Berichten zijn alleen
            zichtbaar voor de deelnemers en — bij een melding of klacht — voor
            onze beheerders.
          </p>

          <H>4. Verwerkers</H>
          <p>Wij schakelen de volgende dienstverleners in, met wie een verwerkersovereenkomst is gesloten:</p>
          <ul className="list-disc space-y-1 pl-5">
            {verwerkers.map((v) => (
              <li key={v.naam}>
                <span className="text-foreground font-medium">{v.naam}</span> — {v.doel}; {v.locatie}.
              </li>
            ))}
          </ul>

          <H>5. Beveiliging</H>
          <p>
            Wachtwoorden worden alleen als hash opgeslagen, verbindingen zijn
            versleuteld (HTTPS), sessies en herstel-links werken met eenmalige,
            kort geldige tokens en accountacties worden gelogd. Toegang tot
            gegevens is beperkt tot wie die voor zijn werk nodig heeft.
          </p>

          <H>6. Jouw rechten</H>
          <p>
            Je hebt recht op inzage, correctie, verwijdering, beperking,
            overdraagbaarheid en bezwaar. Veel hiervan kun je zelf: je profiel
            aanpassen, je gegevens exporteren en je account verwijderen via je
            instellingen. Voor andere verzoeken mail je {BEDRIJF.email}; we
            reageren binnen een maand. Je kunt ook een klacht indienen bij de
            Autoriteit Persoonsgegevens.
          </p>

          <H>7. Cookies</H>
          <p>
            We gebruiken functionele cookies (sessie en cookievoorkeur) en
            eigen statistiekcookies met een gering privacy-effect. Zie ons
            cookiebeleid.
          </p>

          <H>8. Wijzigingen</H>
          <p>
            Bij wezenlijke wijzigingen informeren we je via het platform of per
            e-mail. De actuele versie staat altijd op deze pagina.
          </p>
        </div>
      </Container>
    </>
  );
}
