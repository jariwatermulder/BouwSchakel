import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listInvoicesForUser } from "@/server/payments/invoices";
import { listFacturen } from "@/server/facturen/service";
import { formatEuro } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Facturen",
  robots: { index: false },
};

const EIGEN_STATUS: Record<string, string> = {
  CONCEPT: "Concept",
  VERSTUURD: "Verstuurd",
  BETAALD: "Betaald",
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
        <div className="border-border mt-6 overflow-x-auto rounded-[var(--radius-card)] border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-muted text-foreground-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Nummer</th>
                <th className="px-4 py-3 text-left font-medium">Klant</th>
                <th className="px-4 py-3 text-left font-medium">Datum</th>
                <th className="px-4 py-3 text-right font-medium">Totaal</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">PDF</th>
              </tr>
            </thead>
            <tbody>
              {eigen.map((f) => (
                <tr key={f.id} className="border-border border-t">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/bedrijven/facturen/${f.id}`} className="hover:text-accent-600">
                      {f.factuurnummer}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{f.klantNaam}</td>
                  <td className="text-foreground-muted px-4 py-3">
                    {datum(f.factuurdatum)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatEuro(f.totaalCents)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={f.status === "BETAALD" ? "verified" : "neutral"}>
                      {EIGEN_STATUS[f.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/bedrijven/facturen/${f.id}/pdf`}
                      className="text-accent-600 font-medium hover:underline"
                    >
                      PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
