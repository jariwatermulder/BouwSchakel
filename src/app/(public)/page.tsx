import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

const HERO_FOTO = "/images/hero-samenwerking.jpg";

const heroChips = [
  "Zoeken zonder account",
  "Gratis tijdens de introductie",
  "Rechtstreeks contact",
];

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

        <Container className="py-16 text-white md:py-24">
          <div className="max-w-2xl">
            <h1 className="bs-load text-4xl font-extrabold leading-[1.03] md:text-6xl">
              Vakmensen en opdrachtgevers, rechtstreeks verbonden.
            </h1>
            <p
              className="bs-load mt-5 max-w-xl text-lg leading-relaxed text-white/85"
              style={{ animationDelay: "120ms" }}
            >
              Zoek als opdrachtgever een zzp’er op vakgebied en regio, of laat
              je als vakmens vinden. Geen tussenlaag, geen offertetraject — je
              maakt zelf je afspraken. Tijdens de introductie gratis.
            </p>

            {/* Twee routes als CTA */}
            <div
              className="bs-load mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "160ms" }}
            >
              <ButtonLink
                href="/vind-zzper"
                size="lg"
                className="bg-white! text-brand-700! hover:bg-white/90! justify-center rounded-xl shadow-md"
              >
                Ik zoek een zzp’er
              </ButtonLink>
              <ButtonLink
                href="/registreren?rol=zzp"
                variant="ghost"
                size="lg"
                className="text-white! justify-center rounded-xl border border-white/60 hover:bg-white/10!"
              >
                Ik ben zzp’er
              </ButtonLink>
            </div>

            {/* Vertrouwens-chips */}
            <div
              className="bs-load mt-6 flex flex-col gap-2 text-sm text-white/85 sm:flex-row sm:flex-wrap sm:gap-x-6"
              style={{ animationDelay: "240ms" }}
            >
              {heroChips.map((c) => (
                <span key={c} className="inline-flex items-center gap-2">
                  <span aria-hidden className="font-bold text-white">
                    ✓
                  </span>
                  {c}
                </span>
              ))}
            </div>
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
