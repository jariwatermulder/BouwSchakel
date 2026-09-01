import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";
import { Icon } from "@/components/home/pictos";

export const metadata: Metadata = {
  title: "Contact",
  description: "Neem contact op met ZZP Connect.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="We horen graag van je"
        lead="Vragen over het platform of hulp nodig? Neem gerust contact op."
      />
      <Container className="grid gap-6 py-12 md:grid-cols-2 md:py-16">
        <Card interactive className="border-t-4" style={{ borderTopColor: "#2563eb" }}>
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "#2563eb1a", color: "#2563eb" }}
          >
            <Icon name="chat" className="h-6 w-6" />
          </span>
          <CardTitle className="mt-4">Support</CardTitle>
          <CardDescription>
            Voor vragen over je account, opdrachten of matches. Een
            contactformulier volgt zodra het platform live is.
          </CardDescription>
        </Card>
        <Card interactive className="border-t-4" style={{ borderTopColor: "#7c3aed" }}>
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: "#7c3aed1a", color: "#7c3aed" }}
          >
            <Icon name="grid" className="h-6 w-6" />
          </span>
          <CardTitle className="mt-4">Zakelijk</CardTitle>
          <CardDescription>
            Ben je een groter bedrijf of wil je samenwerken? Neem contact op
            voor de mogelijkheden.
          </CardDescription>
        </Card>
      </Container>
    </>
  );
}
