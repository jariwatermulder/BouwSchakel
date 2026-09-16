import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";
import { listVakgebiedenVoorFilter } from "@/server/zzpers/directory";

export const dynamic = "force-dynamic";

const HERO_FOTO = "/images/hero-samenwerking.jpg";

// Populaire bouw-vakgebieden (eerste focus). Slugs bestaan in de catalogus.
const POPULAIRE_VAKGEBIEDEN = [
  { naam: "Timmerman", slug: "timmerman" },
  { naam: "Elektricien", slug: "elektricien" },
  { naam: "Loodgieter", slug: "loodgieter" },
  { naam: "Schilder", slug: "schilder" },
  { naam: "Tegelzetter", slug: "tegelzetter" },
  { naam: "Metselaar", slug: "metselaar" },
  { naam: "Stukadoor", slug: "stukadoor" },
  { naam: "Dakdekker", slug: "dakdekker" },
  { naam: "Installateur", slug: "installateur" },
  { naam: "Stratenmaker", slug: "stratenmaker" },
];

const stappen = [
  {
    titel: "Zoek op vak en regio",
    tekst: "Kies een vakgebied en je plaats. Zoeken kan zonder account.",
    src: "/images/stap-1-zoeken.png",
    alt: "Telefoon met de ZZP Connect-zoekfunctie: vakgebied en plaats invullen.",
  },
  {
    titel: "Bekijk profielen",
    tekst: "Zie wie er werkt in jouw buurt, met vakgebied en werkgebied.",
    src: "/images/stap-2-profiel.png",
    alt: "Profielkaart van een vakman met vakgebied, werkgebied en ervaring.",
  },
  {
    titel: "Neem rechtstreeks contact op",
    tekst: "Bespreek zelf het werk, het tarief en de planning. Geen tussenlaag.",
    src: "/images/stap-3-contact.png",
    alt: "Contact opnemen met een vakman via bericht, bellen of WhatsApp.",
  },
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

const veld =
  "border-border bg-surface focus-within:ring-brand-500 flex items-center rounded-lg border px-3 focus-within:ring-2";

export default async function HomePage() {
  const vakgebieden = await listVakgebiedenVoorFilter();

  return (
    <>
      {/* ───────────── Hero: zoeken staat voorop ───────────── */}
      <section className="from-brand-50/60 border-border border-b bg-gradient-to-b to-transparent">
        <Container className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-20">
          <div>
            <h1 className="text-4xl font-extrabold leading-[1.02] md:text-5xl">
              Vind een zzp’er voor jouw klus.
            </h1>
            <p className="text-foreground-muted mt-4 max-w-lg text-lg">
              Bekijk vakmensen in jouw regio en neem direct contact op — geen
              opdracht plaatsen nodig.
            </p>

            {/* Zoekformulier → bestaande etalage /vind-zzper */}
            <form
              method="get"
              action="/vind-zzper"
              className="border-border bg-surface shadow-soft mt-7 rounded-2xl border p-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="vak"
                    className="text-foreground mb-1 block text-sm font-medium"
                  >
                    Vakgebied
                  </label>
                  <div className={veld}>
                    <Icon name="wrench" className="text-foreground-muted mr-2 h-5 w-5 shrink-0" />
                    <select
                      id="vak"
                      name="vak"
                      defaultValue=""
                      className="text-foreground h-11 w-full bg-transparent text-sm outline-none"
                    >
                      <option value="">Alle vakgebieden</option>
                      {vakgebieden.map((v) => (
                        <option key={v.slug} value={v.slug}>
                          {v.naam}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="plaats"
                    className="text-foreground mb-1 block text-sm font-medium"
                  >
                    Plaats of regio
                  </label>
                  <div className={veld}>
                    <Icon name="pin" className="text-foreground-muted mr-2 h-5 w-5 shrink-0" />
                    <input
                      id="plaats"
                      name="plaats"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Bijv. Groningen…"
                      className="text-foreground placeholder:text-foreground-muted h-11 w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 focus-visible:ring-brand-500 mt-3 h-12 w-full rounded-xl text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Zoek vakmensen
              </button>
            </form>

            <div className="text-foreground-muted mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-brand-600" aria-hidden>
                  ✓
                </span>
                Zoeken zonder account
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="text-brand-600" aria-hidden>
                  ✓
                </span>
                Gratis tijdens de introductie
              </span>
            </div>

            <p className="text-foreground-muted mt-5 text-sm">
              Ben je zzp’er?{" "}
              <Link
                href="/registreren?rol=zzp"
                className="text-brand-700 font-semibold hover:underline"
              >
                Maak gratis een profiel
              </Link>
            </p>
          </div>

          {/* Rustige, ingekaderde foto — op mobiel ná de zoekfunctie */}
          <div className="border-border relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] border">
            <Image
              src={HERO_FOTO}
              alt="Vakman en opdrachtgever bespreken een klus op de bouwplaats"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-[60%_center]"
            />
          </div>
        </Container>
      </section>

      {/* ───────────── Populaire vakgebieden ───────────── */}
      <section className="py-12 md:py-16">
        <Container>
          <h2 className="text-xl font-bold md:text-2xl">
            Populaire vakgebieden in de bouw
          </h2>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {POPULAIRE_VAKGEBIEDEN.map((v) => (
              <Link
                key={v.slug}
                href={`/vind-zzper?vak=${v.slug}`}
                className="border-border bg-surface text-foreground hover:border-brand-500 hover:text-brand-700 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
              >
                {v.naam}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ───────────── Zo werkt het ───────────── */}
      <section className="bg-surface-muted py-12 md:py-16">
        <Container>
          <h2 className="text-2xl font-bold md:text-3xl">Zo werkt het</h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {stappen.map((stap, i) => (
              <li key={stap.titel} className="flex flex-col items-center text-center">
                <Image
                  src={stap.src}
                  alt={stap.alt}
                  width={820}
                  height={820}
                  sizes="(min-width: 640px) 320px, 80vw"
                  className="h-44 w-44 object-contain md:h-52 md:w-52"
                />
                <p className="text-brand-700 mt-5 text-sm font-semibold">
                  Stap {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{stap.titel}</h3>
                <p className="text-foreground-muted mx-auto mt-2 max-w-xs text-sm leading-relaxed">
                  {stap.tekst}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ───────────── Voor zzp'ers ───────────── */}
      <section className="py-12 md:py-16">
        <Container>
          <div className="border-border bg-surface flex flex-col items-start justify-between gap-6 rounded-[var(--radius-card)] border p-8 md:flex-row md:items-center md:p-10">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold md:text-3xl">Ben je zelfstandige?</h2>
              <p className="text-foreground-muted mt-3">
                Maak gratis een profiel en word gevonden door opdrachtgevers in
                jouw regio. Jij bepaalt je vakgebied, werkgebied en
                beschikbaarheid.
              </p>
            </div>
            <ButtonLink
              href="/registreren?rol=zzp"
              variant="brand"
              size="lg"
              className="shrink-0 rounded-xl"
            >
              Maak gratis een profiel
            </ButtonLink>
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
