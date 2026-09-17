import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";
import { ZoWerktHet } from "@/components/home/zo-werkt-het";
import { VoorOpdrachtgevers, VoorZzpers } from "@/components/home/voor-wie";

const faqs = [
  {
    vraag: "Kost het iets?",
    antwoord:
      "Nee. Tijdens de introductie is ZZP Schakel gratis, voor zowel opdrachtgevers als zzp’ers.",
  },
  {
    vraag: "Moet ik een account maken om te zoeken?",
    antwoord:
      "Nee. Je kunt zonder account vakmensen zoeken en profielen bekijken. Een account is alleen nodig als je zelf een profiel wilt aanmaken.",
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
      {/* ───────────── Hero: wit tekstvlak links, heldere foto rechts ───────────── */}
      <section className="bg-surface relative overflow-hidden">
        <div className="grid md:h-[clamp(620px,76vh,720px)] md:grid-cols-[1.04fr_0.96fr] md:items-stretch">
          {/* Tekstzijde */}
          <div className="relative z-10 flex items-center px-4 py-12 sm:px-6 md:py-0 md:pr-6 md:pl-[max(1.5rem,calc((100vw-72rem)/2+2rem))]">
            <div className="w-full max-w-[36rem]">
              <span className="border-border bg-surface text-foreground inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide">
                <span aria-hidden className="bg-brand-500 h-2 w-2 shrink-0 rounded-full" />
                Hét platform voor vakmensen en opdrachtgevers
              </span>

              <h1 className="mt-5 max-w-[26rem] text-[2.1rem] font-extrabold leading-[1.07] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                <span className="text-foreground">
                  Vakmensen en opdrachtgevers,
                </span>{" "}
                <span className="text-brand-600">rechtstreeks verbonden.</span>
              </h1>

              <p className="text-foreground-muted mt-4 max-w-[32rem] text-lg leading-relaxed">
                Vind een vakman in jouw regio, of laat je als zzp’er vinden.
                Zonder tussenlaag.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink
                  href="/vind-zzper"
                  variant="brand"
                  size="lg"
                  className="justify-center rounded-xl"
                >
                  <Icon name="search" className="h-5 w-5" />
                  Zoek een vakman
                  <span aria-hidden>→</span>
                </ButtonLink>
                <ButtonLink
                  href="/registreren?rol=zzp"
                  variant="outline"
                  size="lg"
                  className="justify-center rounded-xl"
                >
                  Maak een profiel aan
                  <span aria-hidden>→</span>
                </ButtonLink>
              </div>

              <ul className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
                {[
                  { icon: "check" as const, tekst: "Geen account nodig" },
                  { icon: "users" as const, tekst: "Rechtstreeks contact" },
                  { icon: "pin" as const, tekst: "Lokale vakmensen" },
                ].map((v) => (
                  <li
                    key={v.tekst}
                    className="text-foreground-muted flex items-center gap-1.5 text-sm"
                  >
                    <span className="bg-brand-50 text-brand-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      <Icon name={v.icon} className="h-3.5 w-3.5" />
                    </span>
                    {v.tekst}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Fotozijde: personen springen uit een zachte merkkleur-vorm */}
          <div className="relative h-80 sm:h-96 md:h-full">
            {/* Achtergrond: originele locatiefoto (bus/garage) met de personen weggewerkt */}
            <div className="absolute inset-x-0 top-[40%] bottom-0 overflow-hidden md:top-[44%] md:rounded-l-[3rem]">
              <Image
                src="/images/hero-achtergrond-clean.jpg"
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 48vw, 100vw"
                className="object-cover object-[50%_bottom]"
              />
            </div>

            {/* Handgeschreven accent, zoals in de referentie (alleen desktop) */}
            <div className="pointer-events-none absolute top-[13%] right-8 z-20 hidden text-right lg:block">
              <p
                className="text-foreground text-2xl leading-tight"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                Echte vakmensen.
                <br />
                Rechtstreeks in contact.
              </p>
              <svg
                aria-hidden
                viewBox="0 0 60 60"
                className="text-brand-600 mt-1 mr-4 ml-auto h-11 w-11"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M46 6 C 40 26, 30 40, 16 48" />
                <path d="M27 46 L16 49 L18 38" />
              </svg>
            </div>

            {/* Uitgeknipte personen die uit het kader springen */}
            <div className="hero-pop-float absolute top-[14%] right-0 bottom-0 left-[42%] z-10">
              <Image
                src="/images/hero-personen.png"
                alt="Een vakman en een opdrachtgever overleggen samen"
                fill
                priority
                sizes="(min-width: 768px) 40vw, 85vw"
                className="object-contain object-[left_bottom] [filter:drop-shadow(0_22px_30px_rgba(2,8,23,0.30))]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Zo werkt het (interactieve toggle) ───────────── */}
      <ZoWerktHet />

      {/* ───────────── Voor opdrachtgevers / Voor zzp'ers ───────────── */}
      <VoorOpdrachtgevers />
      <VoorZzpers />

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
