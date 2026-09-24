import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";

export const metadata: Metadata = paginaMetadata({
  pad: "/cookies",
  title: "Cookiebeleid",
  index: false,
});

const cookies = [
  {
    naam: "bs_session",
    doel: "Houdt je ingelogd. Bevat alleen een willekeurig sessietoken; de koppeling met je account staat aan onze kant.",
    type: "Functioneel, first-party",
    duur: "Maximaal 30 dagen, of tot je uitlogt",
  },
  {
    naam: "zs_rol",
    doel: "Onthoudt alleen of je bent ingelogd en met welke rol (zzp'er, opdrachtgever of beheer), zodat de menubalk direct klopt. Bevat geen sessietoken en geeft geen toegang.",
    type: "Functioneel, first-party",
    duur: "Maximaal 30 dagen, of tot je uitlogt",
  },
  {
    naam: "zs_oauth",
    doel: "Beveiligt het inloggen met Google of Apple: een eenmalige, ondertekende controlecode tijdens het doorsturen naar en van de inlogdienst.",
    type: "Functioneel, first-party",
    duur: "Maximaal 10 minuten",
  },
  {
    naam: "zs_aid",
    doel: "Eigen bezoekersstatistieken: een willekeurig bezoekersnummer om terugkerende bezoekers te onderscheiden. Het nummer zelf zegt niets over wie je bent; ben je ingelogd, dan koppelen we de metingen wel aan je account (zie de privacyverklaring). We delen niets met derden.",
    type: "Statistiek, first-party, gering privacy-effect",
    duur: "12 maanden",
  },
  {
    naam: "zs_sid",
    doel: "Eigen bezoekersstatistieken: een willekeurig sessienummer om bezoeken (sessies) te tellen.",
    type: "Statistiek, first-party, gering privacy-effect",
    duur: "30 minuten na je laatste activiteit",
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
        lead="ZZP Schakel gebruikt functionele cookies en eigen bezoekersstatistieken. Geen advertentiecookies, geen trackers van derden."
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm leading-relaxed">
          <p>
            Cookies zijn kleine tekstbestanden die je browser opslaat. Wij
            gebruiken twee soorten: functionele cookies (nodig om in te loggen)
            en eigen statistiekcookies met een gering privacy-effect. We plaatsen
            geen advertentie-, tracking- of social-media-cookies en gebruiken
            geen analytische tools van derden (zoals Google Analytics). Onze
            statistieken meten we zelf, zonder IP-adres en zonder de gegevens
            met anderen te delen. Daarom vragen we geen toestemming, maar
            informeren we je met de melding onderaan de pagina. Stel je browser
            in op &ldquo;Do Not Track&rdquo; of Global Privacy Control, dan
            meten we je bezoek niet.
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
            Naast cookies bewaart je browser twee kleine voorkeuren lokaal: dat
            je de cookiemelding hebt gezien en dat je de installatie-melding van
            de app hebt weggeklikt. Die gegevens verlaten je apparaat niet en
            worden niet naar ons verstuurd.
          </p>

          <H>Cookies weigeren of verwijderen</H>
          <p>
            Je kunt cookies via je browserinstellingen blokkeren of verwijderen.
            Zonder de sessiecookie kun je niet ingelogd blijven. Zonder de
            statistiekcookies werkt de site gewoon; we tellen je bezoek dan niet.
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
