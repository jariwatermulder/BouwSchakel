import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { listComplaints } from "@/server/admin/service";
import { behandelKlacht } from "../actions";

export const metadata: Metadata = {
  title: "Klachten",
  robots: { index: false },
};

const STATUSSEN = ["OPEN", "IN_BEHANDELING", "AFGEHANDELD"];

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(d);
}

export default async function AdminKlachtenPage() {
  await requireCurrentAdmin("SUPPORT");
  const klachten = await listComplaints();

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Klachten</h1>
      {klachten.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>Geen klachten.</CardDescription>
        </Card>
      ) : (
        <ul className="mt-6 space-y-2">
          {klachten.map((k) => (
            <li key={k.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">{k.onderwerp}</p>
                  <p className="text-foreground-muted text-sm">
                    {k.naam} · {k.email} · {datum(k.createdAt)}
                  </p>
                  <p className="text-foreground-muted mt-1 text-sm">
                    {k.bericht}
                  </p>
                </div>
                <form action={behandelKlacht} className="flex gap-2">
                  <input type="hidden" name="complaintId" value={k.id} />
                  <select
                    name="status"
                    defaultValue={k.status}
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
