import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "Veelgestelde vragen",
  description: "Antwoorden op de meestgestelde vragen over ZZP Schakel.",
};

const vragen = [
  {
    v: "Wat is ZZP Schakel?",
    a: "Een Nederlands platform dat opdrachtgevers en zelfstandige vakmensen (zzp’ers) rechtstreeks met elkaar in contact brengt. Onze eerste focus is de bouw.",
  },
  {
    v: "Kost het geld?",
    a: "Nee. Tijdens de introductie is ZZP Schakel gratis, voor zowel opdrachtgevers als zzp’ers. Mocht daar iets in veranderen, dan laten we dat vooraf duidelijk weten.",
  },
  {
    v: "Moet ik een account maken om profielen te bekijken?",
    a: "Ja. Om passende profielen te bekijken en contact op te nemen maak je gratis een account aan als opdrachtgever. Zzp’ers maken een account aan om zelf een profiel te plaatsen.",
  },
  {
    v: "Kan ik als particulier een vakman zoeken?",
    a: "ZZP Schakel is bedoeld voor zakelijke opdrachtgevers: bij het aanmaken van een opdrachtgeversaccount vul je een bedrijfsnaam en KvK-nummer in. Ook zzp’ers registreren met hun KvK-nummer.",
  },
  {
    v: "Moet ik een opdracht plaatsen om iemand te benaderen?",
    a: "Nee. Je zoekt op vakgebied en regio, bekijkt profielen en neemt rechtstreeks contact op. Een opdracht plaatsen is niet verplicht.",
  },
  {
    v: "Regelen jullie contracten, uren of betalingen?",
    a: "Nee. ZZP Schakel brengt je met elkaar in contact. Afspraken over het werk, het tarief en de planning maak je rechtstreeks met elkaar; ZZP Schakel is daarbij geen partij.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageIntro
        eyebrow="Veelgestelde vragen"
        title="Goed om te weten"
        lead="De antwoorden op de vragen die het vaakst gesteld worden."
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <div className="space-y-3">
          {vragen.map((item) => (
            <details
              key={item.v}
              className="border-border bg-surface shadow-soft rounded-2xl border p-5 open:[&_svg]:rotate-45"
            >
              <summary className="text-foreground flex cursor-pointer items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {item.v}
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="text-accent-600 h-5 w-5 shrink-0 transition-transform duration-200"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="text-foreground-muted mt-3 text-sm leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </>
  );
}
