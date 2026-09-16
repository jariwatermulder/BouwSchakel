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
          className="hero-foto -z-10 object-cover object-center"
        />
        <div
          aria-hidden
          className="from-ink/95 via-ink/80 to-ink/40 absolute inset-0 -z-10 bg-gradient-to-r"
        />

        <Container className="flex min-h-[58vh] flex-col justify-center py-20 text-white md:min-h-[66vh] md:py-28">
          <div className="max-w-3xl">
            <span className="bs-load inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm">
              Hét platform voor vakmensen en opdrachtgevers
            </span>
            <h1
              className="bs-load mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-balance md:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Vakmensen en opdrachtgevers,{" "}
              <span className="text-white/70">rechtstreeks verbonden.</span>
            </h1>
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
