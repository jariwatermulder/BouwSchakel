import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Over ons",
  description: "Het verhaal achter BouwSchakel.",
};

export default function OverOnsPage() {
  return (
    <>
      <PageIntro
        title="Over ons"
        lead="De juiste vakman. Op het juiste moment."
      />
      <Container className="prose max-w-2xl py-12 md:py-16">
        <p className="text-foreground-muted">
          BouwSchakel is ontstaan uit een simpele observatie: bouwbedrijven
          hebben regelmatig op korte termijn een goede vakman nodig, terwijl
          veel zelfstandige vakmensen juist op zoek zijn naar passend werk in
          hun eigen regio. Die twee vinden elkaar nu vaak via omwegen.
        </p>
        <p className="text-foreground-muted mt-4">
          Wij bouwen een modern, betrouwbaar platform dat vraag en aanbod
          rechtstreeks bij elkaar brengt — met geverifieerde profielen, eerlijke
          reviews en een transparante matching die uitlegt waarom een vakman
          past.
        </p>
        <p className="text-foreground-muted mt-4">
          BouwSchakel is een bemiddelingsplatform. We faciliteren het contact;
          de afspraken over het werk maken opdrachtgever en vakman rechtstreeks
          met elkaar.
        </p>
      </Container>
    </>
  );
}
