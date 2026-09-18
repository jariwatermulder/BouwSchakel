import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listFacturen } from "@/server/facturen/service";
import { FacturenTabel } from "@/components/facturen/facturen-tabel";

export const metadata: Metadata = {
  title: "Facturen",
  robots: { index: false },
};

export default async function BedrijfFacturenPage() {
  const user = await requireCurrentUser();
  const eigen = await listFacturen(user.id);

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Facturen</h1>
          <p className="text-foreground-muted mt-1 text-sm">
            Maak je eigen facturen in de huisstijl van ZZP Schakel.
          </p>
        </div>
        <ButtonLink href="/bedrijven/facturen/nieuw" variant="accent">
          Nieuwe factuur
        </ButtonLink>
      </div>

      {eigen.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>
            Je hebt nog geen eigen facturen gemaakt. Maak je eerste factuur voor
            een klant.
          </CardDescription>
        </Card>
      ) : (
        <div className="mt-6">
          <FacturenTabel
            basisPad="/bedrijven/facturen"
            facturen={eigen.map((f) => ({
              id: f.id,
              nummer: f.factuurnummer,
              klant: f.klantNaam,
              datum: f.factuurdatum.toISOString(),
              vervaldatum: f.vervaldatum ? f.vervaldatum.toISOString() : null,
              totaalCents: f.totaalCents,
              status: f.status,
            }))}
          />
        </div>
      )}
    </Container>
  );
}
