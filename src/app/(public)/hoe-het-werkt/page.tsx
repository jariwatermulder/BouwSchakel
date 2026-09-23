import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";
import { Icon } from "@/components/home/pictos";

export const metadata: Metadata = paginaMetadata({
  pad: "/hoe-het-werkt",
  title: "Hoe het werkt",
  description:
    "Zo werkt ZZP Schakel voor bedrijven en zelfstandige zzp’ers.",
});

const bedrijf = [
  "Kies je vak en regio. Maak gratis een account om passende profielen te bekijken en contact op te nemen.",
  "Bekijk profielen van vakmensen in jouw buurt. Een opdracht plaatsen is niet nodig.",
  "Neem rechtstreeks contact op via berichten in het platform.",
  "Bespreek zelf het werk, het tarief en de planning.",
];

const zzp = [
  "Maak een profiel met je vakgebied en werkgebied.",
  "Stel je beschikbaarheid in; ook ‘in overleg’ kan.",
  "Word gevonden door opdrachtgevers in jouw regio.",
  "Word rechtstreeks benaderd en maak zelf je afspraken.",
];

export default function HoeHetWerktPage() {
  return (
    <>
      <PageIntro
        eyebrow="Hoe het werkt"
        title="Zo werkt ZZP Schakel"
        lead="ZZP Schakel brengt opdrachtgevers en zelfstandige vakmensen rechtstreeks met elkaar in contact. Jullie maken zelf de afspraken."
      />
      <Container className="grid gap-8 py-12 md:grid-cols-2 md:py-16">
        <Card className="border-t-4" style={{ borderTopColor: "#2563eb" }}>
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#2563eb1a", color: "#2563eb" }}
            >
              <Icon name="doc" className="h-5 w-5" />
            </span>
            <CardTitle as="h2">Voor opdrachtgevers</CardTitle>
          </div>
          <ol className="mt-5 space-y-3">
            {bedrijf.map((stap, i) => (
              <li
                key={stap}
                className="text-foreground-muted flex gap-3 text-sm"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {i + 1}
                </span>
                {stap}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="border-t-4" style={{ borderTopColor: "#2563eb" }}>
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#2563eb1a", color: "#2563eb" }}
            >
              <Icon name="bolt" className="h-5 w-5" />
            </span>
            <CardTitle as="h2">Voor zzp&apos;ers</CardTitle>
          </div>
          <ol className="mt-5 space-y-3">
            {zzp.map((stap, i) => (
              <li
                key={stap}
                className="text-foreground-muted flex gap-3 text-sm"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: "#2563eb" }}
                >
                  {i + 1}
                </span>
                {stap}
              </li>
            ))}
          </ol>
        </Card>
      </Container>
      <Container className="pb-16">
        <Card className="bg-navy-50 border-navy-100">
          <div className="flex items-start gap-3">
            <span className="bg-ink text-accent-400 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <div>
              <CardTitle as="h2">Rechtstreeks contact, geen tussenpersoon</CardTitle>
              <CardDescription>
                ZZP Schakel is een communicatieplatform: het brengt
                opdrachtgever en zzp’er met elkaar in contact. Afspraken over het
                werk maak je rechtstreeks met elkaar. Wij regelen geen
                contracten, uren, facturen of betalingen en zijn geen werkgever,
                uitlener of partij bij jullie afspraak.
              </CardDescription>
            </div>
          </div>
        </Card>
      </Container>
    </>
  );
}
