import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { VerifForm } from "@/components/admin/verif-form";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { listDocuments, listZzpVerificaties } from "@/server/admin/service";
import { verifieerDocument, verifieerZzp } from "../actions";

export const metadata: Metadata = {
  title: "Verificaties",
  robots: { index: false },
};

export default async function AdminVerificatiesPage() {
  await requireCurrentAdmin("SUPPORT");
  const [profielen, documenten] = await Promise.all([
    listZzpVerificaties(),
    listDocuments(),
  ]);

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Verificaties</h1>

      <h2 className="mt-6 text-lg font-semibold">ZZP-profielen</h2>
      {profielen.length === 0 ? (
        <Card className="mt-3">
          <CardDescription>Geen profielen ter verificatie.</CardDescription>
        </Card>
      ) : (
        <ul className="mt-3 space-y-2">
          {profielen.map((p) => (
            <li key={p.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {[p.voornaam, p.achternaam].filter(Boolean).join(" ") ||
                      "(naamloos)"}
                  </p>
                  <p className="text-foreground-muted text-sm">
                    {p.kvkNummer ? `KvK ${p.kvkNummer} · ` : ""}
                    {p.profielCompleetheidPct}% compleet
                  </p>
                </div>
                <VerifForm
                  action={verifieerZzp}
                  idField="zzpProfileId"
                  idValue={p.id}
                  current={p.verificatieStatus}
                />
              </Card>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-lg font-semibold">Documenten</h2>
      {documenten.length === 0 ? (
        <Card className="mt-3">
          <CardTitle>Geen documenten</CardTitle>
          <CardDescription>
            Er zijn nog geen documenten geüpload (opslag wordt later
            geactiveerd).
          </CardDescription>
        </Card>
      ) : (
        <ul className="mt-3 space-y-2">
          {documenten.map((d) => (
            <li key={d.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {d.type} — {d.bestandsnaam}
                  </p>
                  <p className="text-foreground-muted text-sm">
                    {d.owner.email}
                  </p>
                </div>
                <VerifForm
                  action={verifieerDocument}
                  idField="documentId"
                  idValue={d.id}
                  current={d.status}
                />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
