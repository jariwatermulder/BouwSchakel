import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { VerifForm } from "@/components/admin/verif-form";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { listCompanies } from "@/server/admin/service";
import { verifieerBedrijf } from "../actions";

export const metadata: Metadata = {
  title: "Bedrijven",
  robots: { index: false },
};

export default async function AdminBedrijvenPage() {
  await requireCurrentAdmin("SUPPORT");
  const companies = await listCompanies();

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Bedrijven</h1>
      <ul className="mt-6 space-y-2">
        {companies.map((c) => (
          <li key={c.id}>
            <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{c.naam || "(naamloos)"}</p>
                <p className="text-foreground-muted text-sm">
                  {c.kvkNummer ? `KvK ${c.kvkNummer} · ` : ""}
                  {c._count.jobs} opdrachten · {c._count.members} leden
                </p>
              </div>
              <VerifForm
                action={verifieerBedrijf}
                idField="companyId"
                idValue={c.id}
                current={c.verificatieStatus}
              />
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  );
}
