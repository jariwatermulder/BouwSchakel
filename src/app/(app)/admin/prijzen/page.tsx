import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { getPricing } from "@/server/payments/pricing";
import { listAllInvoices } from "@/server/payments/invoices";
import { formatEuro } from "@/lib/utils";
import { PricingForm } from "./pricing-form";

export const metadata: Metadata = {
  title: "Prijzen",
  robots: { index: false },
};

export default async function AdminPrijzenPage() {
  await requireCurrentAdmin("SUPPORT");
  const [config, invoices] = await Promise.all([
    getPricing(),
    listAllInvoices(),
  ]);

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Prijzen & facturen</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Alle bedragen zijn configureerbaar. Wijzigingen gelden voor nieuwe
        facturen.
      </p>

      <Card className="mt-6">
        <CardTitle>Fee-instellingen</CardTitle>
        <div className="mt-4">
          <PricingForm config={config} />
        </div>
      </Card>

      <h2 className="mt-8 text-lg font-semibold">Facturen</h2>
      {invoices.length === 0 ? (
        <Card className="mt-3">
          <CardDescription>Nog geen facturen.</CardDescription>
        </Card>
      ) : (
        <ul className="mt-3 space-y-2">
          {invoices.map((f) => (
            <li key={f.id}>
              <Card className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{f.omschrijving}</p>
                  <p className="text-foreground-muted text-sm">
                    {f.assignment?.job ? (
                      <Link
                        href={`/bedrijven/opdrachten/${f.assignment.jobId}`}
                        className="hover:underline"
                      >
                        {f.assignment.job.titel}
                      </Link>
                    ) : (
                      "—"
                    )}
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
