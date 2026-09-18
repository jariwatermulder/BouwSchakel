import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageIntro } from "@/components/layout/page-intro";
import { Icon } from "@/components/home/pictos";
import { BEDRIJF, BEDRIJFSGEGEVENS_COMPLEET } from "@/lib/bedrijfsgegevens";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description:
    "Vragen over ZZP Schakel, je account of je profiel? Stuur ons een bericht; we reageren meestal binnen twee werkdagen.",
};

export default function ContactPage() {
  const email = BEDRIJF.email.startsWith("[") ? null : BEDRIJF.email;
  const telefoon = BEDRIJF.telefoon;

  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="We horen graag van je"
        lead="Vragen over het platform, je account of je profiel? Stuur een bericht — we reageren meestal binnen twee werkdagen."
      />
      <Container className="grid gap-8 py-12 md:grid-cols-[1fr_320px] md:py-16">
        <Card>
          <CardTitle>Stuur ons een bericht</CardTitle>
          <CardDescription>
            Beschrijf je vraag zo concreet mogelijk; dan kunnen we je sneller
            helpen.
          </CardDescription>
          <div className="mt-6">
            <ContactForm />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <span className="bg-brand-50 text-brand-600 flex h-11 w-11 items-center justify-center rounded-xl">
              <Icon name="chat" className="h-5 w-5" />
            </span>
            <CardTitle className="mt-4">Rechtstreeks</CardTitle>
            {email || telefoon ? (
              <ul className="mt-2 space-y-1 text-sm">
                {email ? (
                  <li>
                    <a href={`mailto:${email}`} className="text-brand-600 font-medium hover:underline">
                      {email}
                    </a>
                  </li>
                ) : null}
                {telefoon ? (
                  <li>
                    <a href={`tel:${telefoon.replace(/\s+/g, "")}`} className="text-brand-600 font-medium hover:underline">
                      {telefoon}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <CardDescription>
                Gebruik het formulier; je krijgt antwoord op het e-mailadres dat
                je opgeeft.
              </CardDescription>
            )}
          </Card>

          <Card>
            <span className="bg-brand-50 text-brand-600 flex h-11 w-11 items-center justify-center rounded-xl">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <CardTitle className="mt-4">Klacht of melding</CardTitle>
            <CardDescription>
              Klacht over het platform of een andere gebruiker? Gebruik de{" "}
              <Link href="/klachten" className="text-brand-600 font-medium hover:underline">
                klachtenregeling
              </Link>
              ; die behandelen we vertrouwelijk.
            </CardDescription>
          </Card>

          {BEDRIJFSGEGEVENS_COMPLEET ? (
            <Card>
              <CardTitle>Bedrijfsgegevens</CardTitle>
              <CardDescription>
                {BEDRIJF.naam}
                <br />
                {BEDRIJF.adres}
                <br />
                KvK {BEDRIJF.kvk}
              </CardDescription>
            </Card>
          ) : null}
        </div>
      </Container>
    </>
  );
}
