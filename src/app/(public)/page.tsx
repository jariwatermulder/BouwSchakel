import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

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
      {/* ───────────── Hero: kies je route ───────────── */}
      <section className="from-brand-50/60 border-border border-b bg-gradient-to-b to-transparent">
        <Container className="py-14 text-center md:py-20">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-5xl">
            Vakmensen en opdrachtgevers, rechtstreeks verbonden.
          </h1>
          <p className="text-foreground-muted mx-auto mt-5 max-w-2xl text-lg">
            ZZP Connect brengt zelfstandige vakmensen en opdrachtgevers
            rechtstreeks bij elkaar. Zoek, bekijk profielen en neem contact op —
            of laat je als zzp’er vinden. Tijdens de introductie gratis.
          </p>

          {/* Twee routes */}
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 text-left md:grid-cols-2">
            {/* Opdrachtgever */}
            <div className="border-border bg-surface shadow-soft flex flex-col rounded-[var(--radius-card)] border p-6 md:p-8">
              <Image
                src="/images/stap-1-zoeken.png"
                alt="Zoek een zzp’er op vakgebied en regio"
                width={820}
                height={820}
                priority
                className="mx-auto h-40 w-40 object-contain"
              />
              <h2 className="mt-4 text-xl font-bold">Ik zoek een zzp’er</h2>
              <p className="text-foreground-muted mt-2 text-sm leading-relaxed">
                Zoek op vakgebied en regio, bekijk profielen en neem rechtstreeks
                contact op. Je hoeft geen opdracht te plaatsen.
              </p>
              <div className="mt-6 flex-grow-0 pt-2">
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
                priority
                className="mx-auto h-40 w-40 object-contain"
              />
              <h2 className="mt-4 text-xl font-bold">Ik ben zzp’er</h2>
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
