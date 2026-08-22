import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro title="Privacyverklaring" />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm">
          <p>
            BouwSchakel verwerkt persoonsgegevens volgens de AVG en het beginsel
            van privacy-by-design: we verzamelen niet meer dan nodig is om vraag
            en aanbod bij elkaar te brengen.
          </p>
          <p>
            Je hebt recht op inzage, correctie, export en verwijdering van je
            gegevens. De volledige verklaring — met doeleinden, grondslagen,
            bewaartermijnen en subverwerkers — wordt hier opgenomen zodra deze
            is vastgesteld.
          </p>
        </div>
      </Container>
    </>
  );
}
