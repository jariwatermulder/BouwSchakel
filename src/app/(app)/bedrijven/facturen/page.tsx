import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listInvoicesForUser } from "@/server/payments/invoices";
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
  const invoices = await listInvoicesForUser(user.id);

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Facturen</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Bemiddelingsfacturen voor je afgeronde opdrachten.
      </p>

      {invoices.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>
            Je hebt nog geen facturen. Deze verschijnen na afgeronde opdrachten.
          </CardDescription>
        </Card>
      ) : (
        <ul className="mt-6 space-y-2">
          {invoices.map((f) => (
            <li key={f.id}>
              <Card className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{f.omschrijving}</p>
                  <p className="text-foreground-muted text-sm">
                    {datum(f.uitgegevenOp)} · subtotaal{" "}
                    {formatEuro(f.subtotaalCents)} + btw{" "}
                    {formatEuro(f.btwCents)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatEuro(f.bedragCents)}</p>
                  <Badge
                    variant={f.status === "BETAALD" ? "verified" : "pending"}
                  >
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
