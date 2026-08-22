import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { listReports } from "@/server/admin/service";
import { behandelReport } from "../actions";

export const metadata: Metadata = {
  title: "Reports",
  robots: { index: false },
};

const STATUSSEN = ["OPEN", "IN_BEHANDELING", "AFGEHANDELD", "AFGEWEZEN"];

export default async function AdminReportsPage() {
  await requireCurrentAdmin("SUPPORT");
  const reports = await listReports();

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Meldingen (reports)</h1>
      {reports.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>Geen reports.</CardDescription>
        </Card>
      ) : (
        <ul className="mt-6 space-y-2">
          {reports.map((r) => (
            <li key={r.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">
                    {r.subjectType} · {r.reden}
                  </p>
                  {r.toelichting ? (
                    <p className="text-foreground-muted text-sm">
                      {r.toelichting}
                    </p>
                  ) : null}
                </div>
                <form action={behandelReport} className="flex gap-2">
                  <input type="hidden" name="reportId" value={r.id} />
                  <select
                    name="status"
                    defaultValue={r.status}
                    className="border-border bg-surface h-9 rounded-lg border px-2 text-sm"
                  >
                    {STATUSSEN.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" variant="outline" size="sm">
                    Opslaan
                  </Button>
                </form>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
