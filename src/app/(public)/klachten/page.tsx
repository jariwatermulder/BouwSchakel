import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";
import { Card, CardTitle } from "@/components/ui/card";
import { KlachtForm } from "./klacht-form";

export const metadata: Metadata = {
  alternates: { canonical: "/klachten" },
  title: "Klachten",
  robots: { index: false },
};

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
        <div className="text-foreground-muted space-y-4 text-sm">
          <p>
            Heb je een klacht over het platform of over een andere gebruiker?
            Dien hieronder een melding in. We behandelen die vertrouwelijk en
            nemen zo snel mogelijk contact met je op.
          </p>
          <p>De volledige klachtenregeling wordt hier nog opgenomen.</p>
        </div>

        <Card className="mt-8">
          <CardTitle>Klacht indienen</CardTitle>
          <div className="mt-4">
            <KlachtForm />
          </div>
        </Card>
      </Container>
    </>
  );
}
