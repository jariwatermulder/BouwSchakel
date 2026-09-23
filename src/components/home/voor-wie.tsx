import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/home/pictos";

const punten = [
  {
    icon: "search" as const,
    titel: "Vind vakmensen in jouw regio",
    tekst:
      "Zoek op vakgebied, locatie en werkgebied en ontdek zzp’ers die bij jouw klus passen.",
  },
  {
    icon: "person" as const,
    titel: "Bekijk en vergelijk profielen",
    tekst:
      "Bekijk het vakgebied, werkgebied, ervaring en andere profielinformatie voordat je contact opneemt.",
  },
  {
    icon: "chat" as const,
    titel: "Neem rechtstreeks contact op",
    tekst:
      "Een geschikte vakman gevonden? Neem direct contact op en bespreek samen de klus, planning en het tarief. ZZP Schakel zit daar niet tussen.",
  },
];

const voordelen = [
  "Gratis profiel",
  "Zelf je werkgebied bepalen",
  "Rechtstreeks contact",
];

/** Sectie 1 - Voor opdrachtgevers: tekst + drie punten links, illustratie rechts. */
export function VoorOpdrachtgevers() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <span className="eyebrow">Voor opdrachtgevers</span>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl md:leading-[2.625rem]">
              Waarom ZZP Schakel zo eenvoudig werkt
            </h2>
            <p className="text-foreground-muted mt-4 text-lg leading-relaxed">
              Vind zelfstandige vakmensen op vakgebied en regio, bekijk hun
              profiel en neem rechtstreeks contact op. Geen klus plaatsen en geen
              onnodige tussenstappen.
            </p>

            <ul className="mt-8 space-y-6">
              {punten.map((p) => (
                <li key={p.titel} className="flex gap-4">
                  <span className="bg-brand-50 text-brand-600 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon name={p.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{p.titel}</h3>
                    <p className="text-foreground-muted mt-1 text-sm leading-relaxed">
                      {p.tekst}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/hoe-het-werkt"
              className="text-brand-600 hover:text-brand-700 mt-8 inline-flex items-center gap-1.5 font-semibold"
            >
              Meer over hoe het werkt
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div>
            <Image
              src="/images/zo-werkt/zoeken-telefoon.png"
              alt="De ZZP Schakel-app: zoek vakmensen op vakgebied en regio."
              width={640}
              height={640}
              sizes="(min-width: 768px) 480px, 90vw"
              className="mx-auto h-auto w-full max-w-md rounded-3xl"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Sectie 2 - Voor zzp'ers: tekst + voordelen + CTA links, illustratie rechts. */
export function VoorZzpers() {
  return (
    <section className="bg-brand-50 py-16 md:py-24">
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div>
            <span className="eyebrow">Voor zzp’ers</span>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl md:leading-[2.625rem]">
              Laat opdrachtgevers jou vinden.
            </h2>
            <p className="text-foreground-muted mt-4 text-lg leading-relaxed">
              Maak gratis een profiel aan, kies je vakgebied en werkgebied en
              word zichtbaar voor opdrachtgevers die een vakman zoeken. Jij
              bepaalt zelf waar en wanneer je werkt.
            </p>

            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
              {voordelen.map((v) => (
                <li key={v} className="inline-flex items-center gap-2">
                  <span className="bg-brand-500 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
                    ✓
                  </span>
                  {v}
                </li>
              ))}
            </ul>

            <ButtonLink
              href="/registreren?rol=zzp"
              variant="brand"
              size="lg"
              data-track="cta_clicked"
              data-track-label="voor-zzpers-maak-profiel"
              className="mt-8 w-full justify-center rounded-xl sm:w-auto sm:px-8"
            >
              Maak gratis een profiel
              <span aria-hidden>→</span>
            </ButtonLink>
          </div>

          <div>
            <div className="bg-surface shadow-soft mx-auto max-w-md overflow-hidden rounded-3xl p-3">
              <Image
                src="/images/zo-werkt/zzp-2.png"
                alt="Een zzp’er wordt door opdrachtgevers gevonden in zijn regio."
                width={640}
                height={640}
                sizes="(min-width: 768px) 480px, 90vw"
                className="h-auto w-full rounded-2xl"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
