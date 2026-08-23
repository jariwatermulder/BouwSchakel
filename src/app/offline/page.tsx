import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

// Statische offline-terugval die de service worker toont zonder netwerk.
export const metadata: Metadata = {
  title: "Geen verbinding",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <Container className="max-w-lg py-20 text-center">
      <Card>
        <CardTitle>Je bent offline</CardTitle>
        <p className="text-foreground-muted mt-2">
          Er is op dit moment geen internetverbinding. Zodra je weer online
          bent, kun je verdergaan met BouwSchakel.
        </p>
        <div className="mt-6">
          <ButtonLink href="/" variant="accent">
            Opnieuw proberen
          </ButtonLink>
        </div>
      </Card>
    </Container>
  );
}
