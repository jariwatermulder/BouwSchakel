import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

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

      {/* ───────────── Kies je route ───────────── */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Waar ben je naar op zoek?</span>
            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              Kies wat bij jou past
            </h2>
            <p className="text-foreground-muted mt-2">
              Of je nu een vakmens zoekt of zelf gevonden wilt worden — je bent
              hier goed.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 text-left md:grid-cols-2">
            {/* Opdrachtgever */}
            <div className="border-border bg-surface shadow-soft flex flex-col rounded-[var(--radius-card)] border p-6 md:p-8">
              <Image
                src="/images/stap-1-zoeken.png"
                alt="Zoek een zzp’er op vakgebied en regio"
                width={820}
                height={820}
                className="mx-auto h-40 w-40 object-contain"
              />
              <h3 className="mt-4 text-xl font-bold">Ik zoek een zzp’er</h3>
              <p className="text-foreground-muted mt-2 text-sm leading-relaxed">
                Zoek op vakgebied en regio, bekijk profielen en neem
                rechtstreeks contact op. Je hoeft geen opdracht te plaatsen.
              </p>
              <div className="mt-6 pt-2">
                <ButtonLink
                  href="/vind-zzper"
                  variant="brand"
                  size="lg"
                  className="w-full justify-center rounded-xl"
                >
                  Vind een zzp’er
                </ButtonLink>
              </div>
            </div>

            {/* Zzp'er */}
            <div className="border-border bg-surface shadow-soft flex flex-col rounded-[var(--radius-card)] border p-6 md:p-8">
              <Image
                src="/images/stap-2-profiel.png"
                alt="Maak een profiel als zzp’er en word gevonden"
                width={820}
                height={820}
                className="mx-auto h-40 w-40 object-contain"
              />
              <h3 className="mt-4 text-xl font-bold">Ik ben zzp’er</h3>
              <p className="text-foreground-muted mt-2 text-sm leading-relaxed">
                Maak gratis een profiel en word gevonden door opdrachtgevers in
                jouw regio. Jij bepaalt je vakgebied, werkgebied en
                beschikbaarheid.
              </p>
              <div className="mt-6 flex flex-col gap-2 pt-2">
                <ButtonLink
                  href="/registreren?rol=zzp"
                  variant="brand"
                  size="lg"
                  className="w-full justify-center rounded-xl"
                >
                  Maak gratis een profiel
                </ButtonLink>
                <ButtonLink
                  href="/zzpers"
                  variant="ghost"
                  size="sm"
                  className="justify-center"
                >
                  Meer voor zzp’ers
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

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
