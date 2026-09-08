import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listInvoicesForUser } from "@/server/payments/invoices";
import { listFacturen } from "@/server/facturen/service";
import { FacturenTabel } from "@/components/facturen/facturen-tabel";
import { formatEuro } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Facturen",
  robots: { index: false },
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

export default async function BedrijfFacturenPage() {
  const user = await requireCurrentUser();
  const [eigen, ontvangen] = await Promise.all([
    listFacturen(user.id),
    listInvoicesForUser(user.id),
  ]);

  return (
    <Container className="py-8 md:py-12">
      {/* Eigen facturen */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Facturen</h1>
          <p className="text-foreground-muted mt-1 text-sm">
            Maak je eigen facturen in de huisstijl van ZZP Connect.
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

      {/* Ontvangen bemiddelingsfacturen van het platform */}
      <h2 className="mt-12 text-lg font-semibold">Ontvangen bemiddelingsfacturen</h2>
      <p className="text-foreground-muted mt-1 text-sm">
        Facturen van ZZP Connect voor je afgeronde opdrachten.
      </p>

      {ontvangen.length === 0 ? (
        <Card className="mt-4">
          <CardDescription>
            Je hebt nog geen bemiddelingsfacturen. Deze verschijnen na afgeronde
            opdrachten.
          </CardDescription>
        </Card>
      ) : (
        <ul className="mt-4 space-y-2">
          {ontvangen.map((f) => (
            <li key={f.id}>
              <Card className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{f.omschrijving}</p>
                  <p className="text-foreground-muted text-sm">
                    {datum(f.uitgegevenOp)} · subtotaal{" "}
                    {formatEuro(f.subtotaalCents)} + btw {formatEuro(f.btwCents)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatEuro(f.bedragCents)}</p>
                  <Badge variant={f.status === "BETAALD" ? "verified" : "pending"}>
                    {f.status}
                  </Badge>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
