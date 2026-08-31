import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";

export const metadata: Metadata = {
  title: "Contact",
  description: "Neem contact op met ZZP Connect.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        title="Contact"
        lead="Vragen over het platform of hulp nodig? We horen graag van je."
      />
      <Container className="grid gap-6 py-12 md:grid-cols-2 md:py-16">
        <Card>
          <CardTitle>Support</CardTitle>
          <CardDescription>
            Voor vragen over je account, opdrachten of matches. Een
            contactformulier volgt zodra het platform live is.
          </CardDescription>
        </Card>
        <Card>
          <CardTitle>Zakelijk</CardTitle>
          <CardDescription>
            Ben je een groter bedrijf of wil je samenwerken? Neem contact op
            voor de mogelijkheden.
          </CardDescription>
        </Card>
      </Container>
    </>
  );
}
