import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Veelgestelde vragen",
  description: "Antwoorden op de meestgestelde vragen over ZZP Connect.",
};

const vragen = [
  {
    v: "Wat is ZZP Connect?",
    a: "Een Nederlands bemiddelingsplatform dat opdrachtgevers verbindt met zelfstandige professionals (zzp’ers) in elke sector.",
  },
  {
    v: "Kost het geld?",
    a: "Een profiel aanmaken en opdrachten plaatsen is gratis. Voor bedrijven geldt een bemiddelingsfee bij een succesvolle match. Tarieven zijn altijd vooraf transparant.",
  },
  {
    v: "Is ZZP Connect een uitzendbureau?",
    a: "Nee. ZZP Connect bemiddelt en faciliteert contact. De overeenkomst voor het werk sluit je rechtstreeks met de zzp’er; ZZP Connect is daarbij geen partij.",
  },
  {
    v: "Hoe werkt de matching?",
    a: "Op basis van onder andere vakgebied, beschikbaarheid, locatie, tarief en ervaring krijgt elke zzp’er een matchscore, inclusief uitleg waarom hij past. Geen black box.",
  },
  {
    v: "Hoe weet ik dat een profiel betrouwbaar is?",
    a: "Profielen kunnen worden geverifieerd (o.a. e-mail, telefoon, KvK, certificaten) en reviews zijn alleen mogelijk na een echte opdracht via het platform.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageIntro
        eyebrow="Veelgestelde vragen"
        title="Goed om te weten"
        lead="De antwoorden op de vragen die het vaakst gesteld worden."
      />
      <Container className="max-w-3xl py-12 md:py-16">
        <div className="space-y-3">
          {vragen.map((item) => (
            <details
              key={item.v}
              className="border-border bg-surface shadow-soft rounded-2xl border p-5 open:[&_svg]:rotate-45"
            >
              <summary className="text-foreground flex cursor-pointer items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {item.v}
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="text-accent-600 h-5 w-5 shrink-0 transition-transform duration-200"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="text-foreground-muted mt-3 text-sm leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </>
  );
}
