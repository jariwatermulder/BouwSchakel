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
      <PageIntro title="Veelgestelde vragen" />
      <Container className="max-w-3xl py-12 md:py-16">
        <div className="divide-border border-border bg-surface divide-y rounded-[var(--radius-card)] border">
          {vragen.map((item) => (
            <details key={item.v} className="group p-5">
              <summary className="text-foreground cursor-pointer list-none font-semibold">
                {item.v}
              </summary>
              <p className="text-foreground-muted mt-2 text-sm">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </>
  );
}
