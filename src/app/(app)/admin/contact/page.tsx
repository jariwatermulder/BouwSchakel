import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireCurrentAdmin } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { zetContactStatus } from "./actions";

export const metadata: Metadata = {
  title: "Contactberichten",
  robots: { index: false },
};

const STATUSSEN = ["NIEUW", "BEANTWOORD", "GESLOTEN"] as const;

function datum(d: Date): string {
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function AdminContactPage() {
  await requireCurrentAdmin("SUPPORT");
  const berichten = await db.contactMessage.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  return (
    <Container className="py-8 md:py-12">
      <h1 className="text-2xl font-bold md:text-3xl">Contactberichten</h1>
      <p className="text-foreground-muted mt-1 text-sm">
        Berichten via het contactformulier. Beantwoord ze per e-mail en zet
        daarna de status op ‘Beantwoord’.
      </p>
      {berichten.length === 0 ? (
        <Card className="mt-6">
          <CardDescription>Nog geen berichten.</CardDescription>
        </Card>
      ) : (
        <ul className="mt-6 space-y-2">
          {berichten.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{b.onderwerp}</p>
                  <p className="text-foreground-muted text-sm">
                    {b.naam} ·{" "}
                    <a href={`mailto:${b.email}?subject=${encodeURIComponent(`Re: ${b.onderwerp}`)}`} className="text-brand-600 hover:underline">
                      {b.email}
                    </a>{" "}
                    · {datum(b.createdAt)}
                  </p>
                  <p className="text-foreground-muted mt-2 text-sm whitespace-pre-wrap">{b.bericht}</p>
                </div>
                <form action={zetContactStatus} className="flex shrink-0 gap-2">
                  <input type="hidden" name="id" value={b.id} />
                  <select
                    name="status"
                    defaultValue={b.status}
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
