import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";

export const metadata: Metadata = {
  title: "Voor opdrachtgevers",
  description:
    "Zoek op vakgebied en regio, bekijk profielen van vakmensen en neem rechtstreeks contact op. Geen opdracht plaatsen nodig.",
};

const punten = [
  {
    t: "Zoeken zonder account",
    d: "Zoek op vakgebied en regio en bekijk profielen — je hoeft je nergens eerst voor aan te melden.",
    icon: "match" as const,
  },
  {
    t: "Rechtstreeks contact",
    d: "Je neemt zelf contact op en maakt samen afspraken over het werk, het tarief en de planning. Geen tussenpersoon.",
    icon: "chat" as const,
  },
  {
    t: "Gratis tijdens de introductie",
    d: "Zoeken en contact leggen kost op dit moment niets. We laten vooraf weten als daar iets in verandert.",
    icon: "euro" as const,
  },
];

const stappen = [
  "Zoek op vakgebied en regio.",
  "Bekijk profielen van vakmensen in jouw buurt.",
  "Neem rechtstreeks contact op en maak je afspraken.",
];

export default function OpdrachtgeversLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="from-brand-50/60 border-border border-b bg-gradient-to-b to-transparent">
        <Container className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold leading-[1.05] md:text-5xl">
              Vind de vakman die je nodig hebt.
            </h1>
            <p className="text-foreground-muted mt-4 text-lg">
              Zoek op vakgebied en regio, bekijk profielen en neem rechtstreeks
              contact op. Een opdracht plaatsen is niet verplicht.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/vind-zzper" variant="brand" size="lg" className="rounded-xl">
                Vind een zzp’er
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
              alt="Opdrachtgever en vakman bespreken een klus op locatie"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-[60%_center]"
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
            Een vakman nodig?
          </h2>
          <p className="text-foreground-muted mx-auto mt-3 max-w-xl">
            Zoek op vakgebied en regio en neem rechtstreeks contact op.
          </p>
          <div className="mt-7">
            <ButtonLink href="/vind-zzper" variant="brand" size="lg" className="rounded-xl">
              Vind een zzp’er
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
