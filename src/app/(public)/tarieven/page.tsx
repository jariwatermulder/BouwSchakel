import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = paginaMetadata({
  pad: "/tarieven",
  title: "Tarieven",
  description:
    "ZZP Schakel is tijdens de introductie gratis, voor zzp’ers en opdrachtgevers.",
});

export default function TarievenPage() {
  return (
    <>
      <section className="from-brand-50/60 border-border border-b bg-gradient-to-b to-transparent">
        <Container className="py-12 md:py-16">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Tijdens de introductie gratis
          </h1>
          <p className="text-foreground-muted mt-3 max-w-2xl text-lg">
            Zoeken, een profiel aanmaken en contact leggen kost op dit moment
            niets, voor zowel zzp’ers als opdrachtgevers.
          </p>
        </Container>
      </section>

      <Container className="grid gap-6 py-12 md:grid-cols-2 md:py-16">
        <div className="border-border bg-surface rounded-2xl border p-6">
          <h2 className="text-xl font-bold">Voor zzp’ers</h2>
          <p className="text-brand-700 mt-3 text-3xl font-extrabold">Gratis</p>
          <ul className="mt-4 space-y-2">
            {[
              "Een profiel aanmaken met je vakgebied en werkgebied",
              "Je beschikbaarheid instellen",
              "Gevonden worden en rechtstreeks benaderd worden",
            ].map((v) => (
              <li key={v} className="text-foreground-muted flex gap-2 text-sm">
                <span aria-hidden className="text-brand-600">
                  ✓
                </span>
                {v}
              </li>
            ))}
          </ul>
          <ButtonLink
            href="/registreren?rol=zzp"
            variant="brand"
            className="mt-6 rounded-xl"
          >
            Maak gratis een profiel
          </ButtonLink>
        </div>

        <div className="border-border bg-surface rounded-2xl border p-6">
          <h2 className="text-xl font-bold">Voor opdrachtgevers</h2>
          <p className="text-brand-700 mt-3 text-3xl font-extrabold">Gratis</p>
          <ul className="mt-4 space-y-2">
            {[
              "Gratis account als opdrachtgever",
              "Zoeken op vakgebied en regio en passende profielen bekijken",
              "Rechtstreeks contact opnemen via het platform",
            ].map((v) => (
              <li key={v} className="text-foreground-muted flex gap-2 text-sm">
                <span aria-hidden className="text-brand-600">
                  ✓
                </span>
                {v}
              </li>
            ))}
          </ul>
          <ButtonLink href="/vind-zzper" variant="outline" className="mt-6 rounded-xl">
            Vind een zzp’er
          </ButtonLink>
        </div>
      </Container>

      <Container className="pb-16">
        <div className="border-border bg-surface-muted rounded-2xl border p-6">
          <p className="text-foreground-muted text-sm leading-relaxed">
            ZZP Schakel is een communicatieplatform: je maakt zelf afspraken over
            het werk, het tarief en de planning. Wij regelen geen contracten,
            urenregistratie, facturen of betalingen. Er is nog geen vast
            verdienmodel. Mocht daar iets in veranderen, dan laten we dat vooraf
            duidelijk weten; er worden nooit ongemerkt kosten in rekening
            gebracht.
          </p>
        </div>
      </Container>
    </>
  );
}
