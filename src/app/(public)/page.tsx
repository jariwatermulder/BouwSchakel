import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";
import { ZoWerktHet } from "@/components/home/zo-werkt-het";
import { VoorOpdrachtgevers, VoorZzpers } from "@/components/home/voor-wie";

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
      {/* ───────────── Hero: wit tekstvlak links, heldere foto rechts ───────────── */}
      <section className="bg-surface relative overflow-hidden">
        <div className="grid md:h-[clamp(600px,74vh,690px)] md:grid-cols-[1.12fr_0.88fr] md:items-stretch">
          {/* Tekstzijde */}
          <div className="relative z-10 flex items-center px-4 py-12 sm:px-6 md:py-0 md:pr-10 md:pl-[max(1.5rem,calc((100vw-72rem)/2+2rem))]">
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

              <ul className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
                {[
                  { icon: "check" as const, tekst: "Geen account nodig" },
                  { icon: "users" as const, tekst: "Rechtstreeks contact" },
                  { icon: "pin" as const, tekst: "Lokale vakmensen" },
                ].map((v) => (
                  <li
                    key={v.tekst}
                    className="text-foreground-muted flex items-center gap-2 text-sm"
                  >
                    <span className="bg-brand-50 text-brand-600 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                      <Icon name={v.icon} className="h-3.5 w-3.5" />
                    </span>
                    {v.tekst}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Fotozijde — helder, geen overlay */}
          <div className="relative h-64 overflow-hidden sm:h-80 md:h-full">
            <Image
              src={HERO_FOTO}
              alt="Een vakman en een opdrachtgever overleggen samen op locatie"
              fill
              priority
              sizes="(min-width: 768px) 48vw, 100vw"
              className="hero-approach object-cover object-[58%_center]"
            />
          </div>
        </div>

        {/* Organische, afgeronde overgang tussen wit en foto (alleen desktop) */}
        <svg
          aria-hidden
          className="text-surface pointer-events-none absolute inset-y-0 hidden md:block"
          style={{
            left: "56%",
            width: "150px",
            marginLeft: "-75px",
            filter: "drop-shadow(7px 0 16px rgba(2, 8, 23, 0.22))",
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0 0 L50 0 C 96 28, 96 72, 50 100 L 0 100 Z" />
        </svg>
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
