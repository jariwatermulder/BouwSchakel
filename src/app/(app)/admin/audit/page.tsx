import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { listAuditLog } from "@/server/admin/service";

export const metadata: Metadata = {
  title: "Audit log",
  robots: { index: false },
};

function tijd(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminAuditPage() {
  await requireCurrentAdmin("SUPPORT");
  const logs = await listAuditLog();

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Audit log</h1>
      {logs.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>Nog geen registraties.</CardDescription>
        </Card>
      ) : (
        <Card className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-foreground-muted border-border border-b">
              <tr>
                <th className="py-2 pr-4">Tijd</th>
                <th className="py-2 pr-4">Actor</th>
                <th className="py-2 pr-4">Actie</th>
                <th className="py-2">Onderwerp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-border border-b last:border-0">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {tijd(l.createdAt)}
                  </td>
                  <td className="py-2 pr-4">{l.actor?.email ?? "—"}</td>
                  <td className="py-2 pr-4">{l.actie}</td>
                  <td className="text-foreground-muted py-2">
                    {l.subjectType
                      ? `${l.subjectType} ${l.subjectId ?? ""}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Container>
  );
}
