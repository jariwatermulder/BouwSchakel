import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ZoWerktHet } from "@/components/home/zo-werkt-het";

const HERO_FOTO = "/images/hero-samenwerking.jpg";

const faqs = [
  {
    vraag: "Kost het iets?",
    antwoord:
      "Nee. Tijdens de introductie is ZZP Connect gratis, voor zowel opdrachtgevers als zzp’ers.",
  },
  {
    vraag: "Moet ik een account maken om te zoeken?",
    antwoord:
      "Nee. Je kunt zonder account vakmensen zoeken en profielen bekijken. Een account is alleen nodig als je zelf een profiel wilt aanmaken.",
  },
  {
    vraag: "Regelen jullie contracten, uren of betalingen?",
    antwoord:
      "Nee. ZZP Connect brengt je met elkaar in contact. Afspraken over het werk, het tarief en de planning maak je rechtstreeks met elkaar.",
  },
  {
    vraag: "Hoe neem ik contact op met een zzp’er?",
    antwoord:
      "Open een profiel en gebruik de knop ‘Neem contact op’. De zzp’er bepaalt zelf welke gegevens zichtbaar zijn.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ───────────── Hero met foto-achtergrond ───────────── */}
      <section className="relative isolate overflow-hidden">
        <Image
          src={HERO_FOTO}
          alt="Een zzp’er en een opdrachtgever overleggen samen op locatie"
          fill
          priority
          sizes="100vw"
          className="hero-foto -z-10 object-cover object-[68%_center] md:object-[60%_center]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-white from-[64%] to-transparent to-[97%] md:bg-gradient-to-r md:from-[44%] md:to-[68%]"
        />

        <Container className="flex min-h-[58vh] flex-col justify-center py-20 md:min-h-[66vh] md:py-28">
          <div className="max-w-xl">
            <span className="bs-load border-border bg-surface/80 text-foreground inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-sm">
              <span aria-hidden className="bg-brand-500 h-2 w-2 shrink-0 rounded-full" />
              Hét platform voor vakmensen en opdrachtgevers
            </span>
            <h1
              className="bs-load text-brand-600 mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-balance md:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Vakmensen en opdrachtgevers, rechtstreeks verbonden.
            </h1>
            <p
              className="bs-load text-foreground-muted mt-5 max-w-xl text-lg leading-relaxed"
              style={{ animationDelay: "140ms" }}
            >
              Vind rechtstreeks een vakman in jouw regio, of laat je als zzp’er
              vinden. Zonder tussenlaag. Tijdens de introductie gratis.
            </p>
          </div>
        </Container>
      </section>

      {/* ───────────── Zo werkt het (interactieve toggle) ───────────── */}
      <ZoWerktHet />

      {/* ───────────── Veelgestelde vragen ───────────── */}
      <section className="bg-surface-muted py-12 md:py-16">
        <Container className="max-w-3xl">
          <h2 className="text-2xl font-bold md:text-3xl">Veelgestelde vragen</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <details
                key={f.vraag}
                className="border-border bg-surface group rounded-2xl border p-5"
              >
                <summary className="text-foreground flex cursor-pointer items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.vraag}
                  <span
                    aria-hidden
                    className="text-brand-600 shrink-0 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="text-foreground-muted mt-3 text-sm leading-relaxed">
                  {f.antwoord}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
