import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listFacturen } from "@/server/facturen/service";
import { formatEuro } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Facturen",
  robots: { index: false },
};

const STATUS: Record<string, string> = {
  CONCEPT: "Concept",
  VERSTUURD: "Verstuurd",
  BETAALD: "Betaald",
};

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

export default async function FacturenPage() {
  const user = await requireCurrentUser();
  const facturen = await listFacturen(user.id);

  return (
    <Container className="py-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Facturen</h1>
          <p className="text-foreground-muted mt-1 text-sm">
            Maak en beheer je facturen in de huisstijl van ZZP Connect.
          </p>
        </div>
        <ButtonLink href="/zzpers/facturen/nieuw" variant="accent">
          Nieuwe factuur
        </ButtonLink>
      </div>

      {facturen.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>
            Je hebt nog geen facturen. Maak je eerste factuur — koppel hem aan
            een opdracht of vul zelf de gegevens in.
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
              {facturen.map((f) => (
                <tr key={f.id} className="border-border border-t">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/zzpers/facturen/${f.id}`} className="hover:text-accent-600">
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
                      {STATUS[f.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/zzpers/facturen/${f.id}/pdf`}
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
    </Container>
  );
}
