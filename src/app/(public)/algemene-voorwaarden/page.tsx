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
      <PageIntro eyebrow="Juridisch" title="Algemene voorwaarden" />
      <Container className="max-w-3xl py-12 md:py-16">
        <LegalNotice />
        <div className="text-foreground-muted space-y-4 text-sm">
          <p>
            ZZP Connect is een communicatieplatform dat opdrachtgevers en
            zelfstandige zzp’ers met elkaar in contact brengt. ZZP Connect is
            geen partij bij de afspraken die tussen opdrachtgever en zzp’er tot
            stand komen en treedt niet op als werkgever of uitlener. Afspraken
            over het werk, het tarief en de planning maken beide partijen
            rechtstreeks met elkaar; wij regelen geen contracten, uren, facturen
            of betalingen.
          </p>
          <p>
            De volledige voorwaarden — over onder meer gebruik van het platform,
            verplichtingen van partijen, aansprakelijkheid en beëindiging —
            worden hier opgenomen zodra ze door een jurist zijn vastgesteld.
          </p>
        </div>
      </Container>
    </>
  );
}
