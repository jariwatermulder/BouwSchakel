import type { Metadata } from "next";
import { HeroFoto } from "@/components/home/hero-foto";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
import { Icon } from "@/components/home/pictos";
import { ZoWerktHet } from "@/components/home/zo-werkt-het";
import { Vakgebieden } from "@/components/home/vakgebieden";
import { VoorOpdrachtgevers, VoorZzpers } from "@/components/home/voor-wie";

const faqs = [
  {
    vraag: "Kost het iets?",
    antwoord:
      "Nee. Tijdens de introductie is ZZP Schakel gratis, voor zowel opdrachtgevers als zzp’ers.",
  },
  {
    vraag: "Moet ik een account maken om profielen te bekijken?",
    antwoord:
      "Ja. Om passende profielen te bekijken en contact op te nemen maak je gratis een account aan als opdrachtgever — zo weten beide partijen met wie ze praten. Zzp’ers maken een account aan om zelf een profiel te plaatsen.",
  },
  {
    vraag: "Regelen jullie contracten, uren of betalingen?",
    antwoord:
      "Nee. ZZP Schakel brengt je met elkaar in contact. Afspraken over het werk, het tarief en de planning maak je rechtstreeks met elkaar.",
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
      {/* ───────────── Hero: tekst links, fotografie als onderdeel van de interface rechts ───────────── */}
      <section className="bg-surface relative overflow-hidden">
        {/* Zachte lichtblauwe sfeer achter de tekstzijde */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60rem 42rem at -8% -25%, rgba(37,99,235,0.07), transparent 60%)",
          }}
        />

        <div className="relative grid xl:min-h-[clamp(650px,calc(100vh-76px-60px),750px)] xl:grid-cols-[minmax(0,52fr)_minmax(0,48fr)]">
          {/* Tekstzijde */}
          <div className="relative z-20 flex items-center px-4 pt-12 pb-6 sm:px-6 xl:py-12 xl:pr-4 xl:pl-[max(1.5rem,calc((100vw-72rem)/2+2rem))]">
            <div className="w-full max-w-[36rem]">
              <span
                className="bs-load border-border bg-surface text-foreground inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide"
                style={{ animationDelay: "0ms" }}
              >
                <span aria-hidden className="bg-brand-500 h-2 w-2 shrink-0 rounded-full" />
                Hét platform voor vakmensen en opdrachtgevers
              </span>

              <h1
                className="bs-load mt-5 max-w-[30rem] text-[2.1rem] font-bold leading-[1.06] tracking-tight sm:text-5xl xl:text-[3.25rem] 2xl:text-[3.5rem]"
                style={{ animationDelay: "100ms" }}
              >
                <span className="text-foreground">
                  Vakmensen en opdrachtgevers,
                </span>{" "}
                <span className="text-brand-600">rechtstreeks verbonden.</span>
              </h1>

              <p
                className="bs-load text-foreground-muted mt-4 max-w-[30rem] text-lg leading-relaxed"
                style={{ animationDelay: "200ms" }}
              >
                Vind een vakman in jouw regio, of laat je als zzp’er vinden.
                Zonder tussenlaag.
              </p>

              <div
                className="bs-load mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:flex-nowrap"
                style={{ animationDelay: "300ms" }}
              >
                <ButtonLink
                  href="/vind-zzper"
                  variant="brand"
                  size="lg"
                  data-track="cta_clicked"
                  data-track-label="hero-zoek-vakman"
                  className="justify-center rounded-xl shadow-[0_10px_24px_-12px_rgba(37,99,235,0.7)] transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-12px_rgba(37,99,235,0.8)] motion-reduce:transform-none"
                >
                  <Icon name="search" className="h-5 w-5" />
                  Zoek een vakman
                  <span aria-hidden>→</span>
                </ButtonLink>
                <ButtonLink
                  href="/registreren?rol=zzp"
                  variant="outline"
                  size="lg"
                  data-track="cta_clicked"
                  data-track-label="hero-maak-profiel"
                  className="bg-surface/80 justify-center rounded-xl backdrop-blur-sm transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
                >
                  Maak een profiel aan
                  <span aria-hidden>→</span>
                </ButtonLink>
              </div>

              <ul
                className="bs-load mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3"
                style={{ animationDelay: "380ms" }}
              >
                {[
                  { icon: "check" as const, tekst: "Gratis account" },
                  { icon: "users" as const, tekst: "Rechtstreeks contact" },
                  { icon: "search" as const, tekst: "Zoek op vak en regio" },
                ].map((v) => (
                  <li key={v.tekst} className="flex items-center gap-2 whitespace-nowrap">
                    <span className="bg-brand-50 text-brand-600 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                      <Icon name={v.icon} className="h-4 w-4" />
                    </span>
                    <span className="text-foreground-muted text-[13px] font-medium sm:text-sm xl:text-[13px] 2xl:text-sm">{v.tekst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Fotozijde: onder de tekst op mobiel; op desktop de rechter 68% tot de schermrand */}
          <div className="relative z-10 -mx-4 mt-8 sm:-mx-6 xl:static xl:mx-0 xl:mt-0">
            <HeroFoto />
          </div>
        </div>
      </section>

      {/* ───────────── Zo werkt het (interactieve toggle) ───────────── */}
      <ZoWerktHet />

      {/* ───────────── Voor opdrachtgevers ───────────── */}
      <VoorOpdrachtgevers />

      {/* ───────────── Vakgebieden: drie kaarten naar de gefilterde etalage ───────────── */}
      <Vakgebieden />

      {/* ───────────── Voor zzp'ers ───────────── */}
      <VoorZzpers />

      {/* ───────────── Veelgestelde vragen ───────────── */}
      <section className="bg-surface-muted py-12 md:py-16">
        <Container className="max-w-3xl">
          <h2 className="text-3xl font-bold md:text-4xl md:leading-[2.625rem]">Veelgestelde vragen</h2>
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
