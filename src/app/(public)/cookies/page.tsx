import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";

export const metadata: Metadata = {
  title: "Cookiebeleid",
  robots: { index: false },
  alternates: { canonical: "/cookies" },
};

const cookies = [
  {
    naam: "session",
    doel: "Houdt je ingelogd. Bevat alleen een willekeurig sessietoken; de koppeling met je account staat aan onze kant.",
    type: "Functioneel, first-party",
    duur: "Maximaal 30 dagen, of tot je uitlogt",
  },
  {
    naam: "cookie-consent",
    doel: "Onthoudt dat je de cookiemelding hebt gezien, zodat we die niet elke keer tonen.",
    type: "Functioneel, first-party",
    duur: "12 maanden",
  },
];

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-foreground mt-8 text-lg font-semibold">{children}</h2>;
}

export default function CookiesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Juridisch"
        title="Cookiebeleid"
        lead="ZZP Schakel gebruikt alleen cookies die nodig zijn om het platform te laten werken."
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm leading-relaxed">
          <p>
            Cookies zijn kleine tekstbestanden die je browser opslaat. Wij
            gebruiken uitsluitend functionele cookies, waarvoor volgens de
            Telecommunicatiewet geen toestemming nodig is. We plaatsen geen
            advertentie-, tracking- of social-media-cookies en gebruiken geen
            analytische tools van derden. Daarom vragen we geen toestemming,
            maar informeren we je alleen.
          </p>

          <div className="border-border overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted text-foreground">
                <tr>
                  <th className="p-3 font-semibold">Cookie</th>
                  <th className="p-3 font-semibold">Doel</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Bewaartermijn</th>
                </tr>
              </thead>
              <tbody>
                {cookies.map((c) => (
                  <tr key={c.naam} className="border-border border-t align-top">
                    <td className="text-foreground p-3 font-mono">{c.naam}</td>
                    <td className="p-3">{c.doel}</td>
                    <td className="p-3">{c.type}</td>
                    <td className="p-3">{c.duur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H>Lokale opslag</H>
          <p>
            Naast cookies kan je browser kleine voorkeuren lokaal bewaren (zoals
            de installatie-melding van de app). Die gegevens verlaten je apparaat
            niet.
          </p>

          <H>Cookies weigeren of verwijderen</H>
          <p>
            Je kunt cookies via je browserinstellingen blokkeren of verwijderen.
            Zonder de sessiecookie kun je niet ingelogd blijven; zoeken en
            profielen bekijken werkt wel.
          </p>

          <H>Wijzigingen</H>
          <p>
            Voegen we in de toekomst cookies toe waarvoor toestemming nodig is,
            dan vragen we die vooraf en werken we deze pagina bij.
          </p>
        </div>
      </Container>
    </>
  );
}
