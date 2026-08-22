import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";
import { LegalNotice } from "@/components/layout/legal-notice";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  robots: { index: false },
};

export default function AlgemeneVoorwaardenPage() {
  return (
    <>
      <PageIntro title="Algemene voorwaarden" />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm">
          <p>
            BouwSchakel is een bemiddelingsplatform dat bouwbedrijven en
            zelfstandige vakmensen met elkaar in contact brengt. BouwSchakel is
            geen partij bij de overeenkomst die tussen opdrachtgever en vakman
            tot stand komt en treedt niet op als werkgever of uitlener.
          </p>
          <p>
            De volledige voorwaarden — over onder meer gebruik van het platform,
            verplichtingen van partijen, aansprakelijkheid, betaling en
            beëindiging — worden hier opgenomen zodra ze door een jurist zijn
            vastgesteld.
          </p>
        </div>
      </Container>
    </>
  );
}
