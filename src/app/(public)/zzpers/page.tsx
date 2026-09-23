import type { Metadata } from "next";
import { paginaMetadata } from "@/lib/seo";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";

export const metadata: Metadata = paginaMetadata({
  pad: "/zzpers",
  title: "Word gevonden als zzp’er",
  description:
    "Maak je profiel en laat opdrachtgevers zien wat je doet en waar je werkt. Gratis tijdens de introductie.",
});

const punten = [
  {
    t: "Word gevonden",
    d: "Opdrachtgevers zoeken op vakgebied en regio en vinden jouw profiel. Zij nemen rechtstreeks contact op.",
    icon: "match" as const,
  },
  {
    t: "Jij bepaalt",
    d: "Kies zelf je vakgebied, werkgebied en beschikbaarheid. Een indicatief tarief mag, maar hoeft niet.",
    icon: "euro" as const,
  },
  {
    t: "Gratis tijdens de introductie",
    d: "Een profiel aanmaken en benaderd worden kost op dit moment niets.",
    icon: "shield" as const,
  },
];

const stappen = [
  "Maak in een paar minuten een profiel aan.",
  "Stel je vakgebied, werkgebied en beschikbaarheid in.",
  "Word gevonden en rechtstreeks benaderd door opdrachtgevers.",
];

export default function ZzpLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="from-brand-50/60 border-border border-b bg-gradient-to-b to-transparent">
        <Container className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold leading-[1.05] md:text-5xl">
              Word gevonden voor jouw vak.
            </h1>
            <p className="text-foreground-muted mt-4 text-lg">
              Maak gratis een profiel en word gevonden door opdrachtgevers in
              jouw regio. Jij bepaalt je vakgebied, werkgebied en
              beschikbaarheid.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/registreren?rol=zzp" variant="brand" size="lg" className="rounded-xl">
                Maak gratis een profiel
              </ButtonLink>
              <ButtonLink
                href="/hoe-het-werkt"
                variant="outline"
                size="lg"
                className="rounded-xl"
              >
                Hoe het werkt
              </ButtonLink>
            </div>
          </div>
          <div className="border-border relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border">
            <Image
              src="/images/hero-samenwerking.jpg"
              alt="Vakman aan het werk op locatie"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-[35%_center]"
            />
          </div>
        </Container>
      </section>

      {/* Voordelen */}
      <section className="py-14 md:py-20">
        <Container>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Waarom ZZP Schakel
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {punten.map((p) => (
              <div key={p.t} className="border-border bg-surface rounded-2xl border p-6">
                <span className="bg-brand-50 text-brand-600 flex h-11 w-11 items-center justify-center rounded-xl">
                  <Icon name={p.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{p.t}</h3>
                <p className="text-foreground-muted mt-2 text-sm leading-relaxed">
                  {p.d}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Zo werkt het */}
      <section className="bg-surface-muted py-14 md:py-20">
        <Container>
          <h2 className="text-2xl font-bold md:text-3xl">Zo werkt het</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {stappen.map((stap, i) => (
              <li key={stap} className="border-border bg-surface rounded-2xl border p-6">
                <span className="bg-brand-50 text-brand-700 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold tabular-nums">
                  {i + 1}
                </span>
                <p className="text-foreground mt-4">{stap}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-14 md:py-20">
        <Container className="text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Klaar om gevonden te worden?
          </h2>
          <p className="text-foreground-muted mx-auto mt-3 max-w-xl">
            Maak gratis een profiel aan. Je kunt later altijd meer toevoegen.
          </p>
          <div className="mt-7">
            <ButtonLink href="/registreren?rol=zzp" variant="brand" size="lg" className="rounded-xl">
              Maak gratis een profiel
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
