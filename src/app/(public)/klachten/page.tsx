import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";

export const metadata: Metadata = {
  title: "Klachten",
  robots: { index: false },
};

export default function KlachtenPage() {
  return (
    <>
      <PageIntro
        title="Klachten"
        lead="We nemen klachten serieus en streven naar een snelle, eerlijke afhandeling."
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm">
          <p>
            Heb je een klacht over het platform of over een andere gebruiker? Er
            komt een klachtenprocedure waarmee je een melding kunt indienen, die
            we vertrouwelijk en volgens een vaste procedure behandelen.
          </p>
          <p>De volledige klachtenregeling wordt hier opgenomen.</p>
        </div>
      </Container>
    </>
  );
}
